# @lcsga/ng-operators

## Breaking changes:

- ### v2.0.0
  ####
  `fromChildEvent` and `fromChildrenEvent` must now be used in an injection context (or you can now provide a new buildNotifier if need).

<br/>

### This package provides a set of custom RxJS operators, used to make declarative pattern easier to set up within an angular app.

<br/>

- [fromChildEvent](./src/lib/from-child-event.ts): This operator is usefull whenever you want to listen to some `@ViewChild` or `@ContentChild` events.

  ```ts
  fromChildEvent<T extends Event>(
    childSelector: () => ElementRef | undefined,
    type: keyof HTMLElementEventMap,
    options?: EventListenerOptions
  ): Observable<T>
  ```

  | argument        | type                                                              | description                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | --------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `childSelector` | `() => ElementRef`                                                | A callback function used to get the child element to listen an event to.                                                                                                                                                                                                                                                                                                                                                         |
  | `type`          | `keyof HTMLElementEventMap`                                       | The type of event to listen.                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `options`       | `EventListenerOptions & { buildNotifier?: ObservableInput<any> }` | Optional. Default is `{}`.<br/>Options to pass through to the underlying addListener, addEventListener or on functions<br/>`buildNotifier` is a notifier to rebuild the inner `fromEvent` based on a custom notifier. It's usefull for an element destruction with an `NgIf` for example, or if it's used outside of an inject context (it uses `NgZone` as a default notifier, until the signal based components get realised). |

  <br/>

  <details>
  <summary>Why do we need it?</summary>

  Currently, when you want to avoid using the Angular's `@HostListner` or the `(click)="doSomething()"`, you can create a `Subject` and use it like this:

  ```ts
  @Component({
      selector: "app",
      template: "<button (click)="buttonClick$$.next()">Click me!</button>"
  })
  export class AppComponent {
      protected readonly buttonClick$$ = new Subject<void>();

      private readonly onButtonClick$ = this.buttonClick$$.pipe(
          tap(() => console.log("hello world!"))
      );

      constructor() {
          this.onButtonClick$.subscribe();
      }
  }
  ```

  It actually works pretty well but since we need to specifically call the `next()` method of the `buttonClick$$` subject, it's not fully declarative.

  To make it declarative, we would instead need to use the `fromEvent` operator from RxJS but we can't do that nicely because it takes an element from the dom.

  Indeed to get such an element in Angular, depending on what you've built, you can either use `@ViewChild` or `@ContentChild`

  ```ts
  @Component({
    selector: 'app',
    template: '<button #button>Click me!</button>',
  })
  export class AppComponent {
    @ViewChild('button')
    private readonly button?: ElementRef<HTMLButtonElement>;

    private readonly onButtonClick$ = fromEvent(this.button?.nativeElement, 'click').pipe(
      // throws an error!
      tap(() => console.log('hello world!'))
    );

    constructor() {
      this.onButtonClick$.subscribe();
    }
  }
  ```

  The issue with the code above is that the `button` element is `undefined` until the dom is rendered. Thus the `Cannot read properties of undefined (reading 'addEventListener')` error is thrown.

  A solution to make it work would be to assign the stream of `onButtonClick$` within the `afterViewInit()` method but the best part of declarative is to write the assigning right at the declaration, so it wouldn't be prefect.

  **Here comes the `fromChildEvent` custom operator, to the rescue!**
  It works by listening the event of your choice directly on the `document` and check if the event's `target` is the same as a viewChild or a contentChild you'd pass to it

  </details>

  <br/>

  #### Example:

  ```ts
  @Component({
    selector: 'app',
    template: '<button #button>Click me!</button>',
  })
  export class AppComponent {
    @ViewChild('button')
    private readonly button?: ElementRef<HTMLButtonElement>;

    private readonly onButtonClick$ = fromChildEvent(() => this.button!, 'click').pipe(
      tap(() => console.log('hello world!'))
    );

    constructor() {
      this.onButtonClick$.subscribe();
    }
  }
  ```

  As you can see, `fromChildEvent` takes a selector callback to get the viewChild or contentChild target.

  Since the document's event can only be fired after the dom is rendered, we know that the element passed within the selector callback is always available.

<br/>

- [fromChildrenEvent](./src/lib/from-children-event.ts): It works exactly like `fromChildEvent` but with `@ViewChildren` or `@ContentChildren` instead!

  ```ts
  fromChildrenEvent<T extends Event>(
    childrenSelector: () => ElementRef[] | undefined,
    type: keyof HTMLElementEventMap,
    options?: EventListenerOptions
  ): Observable<T>
  ```

  | argument           | type                                                              | description                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | ------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `childrenSelector` | `() => ElementRef[] \| undefined`                                 | A callback function used to get the children elements to listen an event to.                                                                                                                                                                                                                                                                                                                                                     |
  | `type`             | `keyof HTMLElementEventMap`                                       | The type of event to listen.                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `options`          | `EventListenerOptions & { buildNotifier?: ObservableInput<any> }` | Optional. Default is `{}`.<br/>Options to pass through to the underlying addListener, addEventListener or on functions<br/>`buildNotifier` is a notifier to rebuild the inner `fromEvent` based on a custom notifier. It's usefull for an element destruction with an `NgIf` for example, or if it's used outside of an inject context (it uses `NgZone` as a default notifier, until the signal based components get realised). |

    <br/>

  #### Example:

  ```ts
  @Component({
    selector: 'app',
    template: `
      <button #button>Click me!</button>

      <button #button>Click me!</button>

      <button #button>Click me!</button>
    `,
  })
  export class AppComponent {
    @ViewChildren('button')
    private readonly buttons?: QueryList<ElementRef<HTMLButtonElement>>;

    private readonly onButtonsClick$ = fromChildrenEvent(() => this.buttons!.toArray(), 'click').pipe(
      tap(() => console.log('hello world!'))
    );

    constructor() {
      this.onButtonsClick$.subscribe();
    }
  }
  ```

  <br/>

- [fromChildOutput](./src/lib/from-child-output.ts): This operator is usefull whenever you want to listen to some `@ViewChild` or `@ContentChild` outputs or observables for a `Component` or a `Directive` instead of an `ElementRef`.

  ```ts
    export const fromChildOutput = <TChild extends object, TOutput extends PickOutput<TChild>>(
      childSelector: () => TChild | undefined,
      outputName: keyof TOutput,
      { buildNotifier }: { buildNotifier?: ObservableInput<any> } = {}
    ): Observable<TOutput[keyof TOutput]>
  ```

  See [PickOutput](./src/lib/utils/pick-output.type.ts)</summary> utility type

  | argument        | type                                                              | description                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | --------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `childSelector` | `() => ElementRef`                                                | A callback function used to get the child element to listen an event to.                                                                                                                                                                                                                                                                                                                                                         |
  | `type`          | `keyof HTMLElementEventMap`                                       | The type of event to listen.                                                                                                                                                                                                                                                                                                                                                                                                     |
  | `options`       | `EventListenerOptions & { buildNotifier?: ObservableInput<any> }` | Optional. Default is `{}`.<br/>Options to pass through to the underlying addListener, addEventListener or on functions<br/>`buildNotifier` is a notifier to rebuild the inner `fromEvent` based on a custom notifier. It's usefull for an element destruction with an `NgIf` for example, or if it's used outside of an inject context (it uses `NgZone` as a default notifier, until the signal based components get realised). |

  <br/>

  Example:

  ```ts
  @Component({
    selector: 'app-child',
    template: `<button (click)="sayHello.emit('hello!')">Say hello</button>`,
  })
  class AppChildComponent {
    // @Output is not necessary here, if you don't use the angular (eventName)="doSomething()" syntax
    // 'sayHello' must be public to be accessed
    sayHello = new EventEmitter<string>();
  }

  @Component({
    selector: 'app-root',
    template: '<app-child #child />',
  })
  export class AppComponent {
    @ViewChild('child') child!: AppChildComponent;

    constructor() {
      // the second argument is infered from the child as the childSelector
      fromChildOutput(() => this.child, 'sayHello').subscribe(console.log);
      // on child button click => Output: hello!
    }
  }
  ```
