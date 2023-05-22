# @lcsga/ng-operators

## Breaking changes:

### v4.0.0

- `fromChildrenEvent` now returns an `Observable<readonly [event: Event, index: number]>`

### v3.0.0

- update angular to v16 (will throw a nice error message if it's called without access to `inject`)

### v2.0.0

- `fromChildEvent` and `fromChildrenEvent` must now be used in an injection context (or you can now provide a new `buildNotifier` option if needed).

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
  | `childSelector` | `() => ElementRef \| undefined`                                   | A callback function used to get the child element to listen an event to.                                                                                                                                                                                                                                                                                                                                                         |
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
      options: EventListenerOptions & { buildNotifier?: ObservableInput<any> } = {}
    ): Observable<readonly [event: T, index: number]>
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

- [fromHostEvent](./src/lib/from-host-event.ts): This operator is usefull as an Rx replacement for `@HostListner`.

  ```ts
    fromHostEvent<T extends Event>(
      type: keyof HTMLElementEventMap,
      options: EventListenerOptions & { host?: ElementRef } = {}
    ): Observable<T>
  ```

  | argument  | type                                           | description                                                                                                                                                                                                                 |
  | --------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `type`    | `keyof HTMLElementEventMap`                    | The type of event to listen.                                                                                                                                                                                                |
  | `options` | `EventListenerOptions & { host?: ElementRef }` | Optional. Default is `{}`.<br/>Options to pass through to the underlying addListener, addEventListener or on functions<br/>`host` is an `ElementRef` to pass whenever the operator is used outside of an injection context. |

  <br/>

  Example:

  ```ts
  @Component({
    selector: 'app-root',
    template: '',
  })
  export class AppComponent {
    constructor() {
      fromHostEvent('click').subscribe(() => console.log('hello world!'));
      // on app-root click => Output: hello world!
    }
  }
  ```

  <br/>

- [fromChildOutput](./src/lib/from-child-output.ts): This operator is usefull whenever you want to listen to some `@ViewChild` or `@ContentChild` outputs or observables for a `Component` or a `Directive` instead of an `ElementRef`.

  ```ts
    fromChildOutput<TChild extends object, TOutput extends PickOutput<TChild>, TOutputName extends keyof TOutput>(
      childSelector: () => TChild | undefined,
      outputName: TOutputName,
      { buildNotifier }: { buildNotifier?: ObservableInput<any> } = {}
    ): Observable<TOutput[TOutputName]>
  ```

  See [PickOutput](./src/lib/utils/pick-output.type.ts)</summary> utility type

  | argument        | type                                       | description                                                                                                                                                                                                                                                                                                                                     |
  | --------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `childSelector` | `() => TChild \| undefined`                | A callback function used to get the child element to listen an event to.                                                                                                                                                                                                                                                                        |
  | `outputName`    | `TOutputName`                              | The name of the public observable to listen.                                                                                                                                                                                                                                                                                                    |
  | `options`       | `{ buildNotifier?: ObservableInput<any> }` | Optional. Default is `{}`.<br/>The option `buildNotifier` is a notifier to rebuild the inner `fromEvent` based on a custom notifier. It's usefull for an element destruction with an `NgIf` for example, or if it's used outside of an inject context (it uses `NgZone` as a default notifier, until the signal based components get realised). |

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
    imports: [AppChildComponent],
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

  <br/>

- [fromChildrenOutput](./src/lib/from-children-output.ts): It works exactly like `fromChildOutput` but for an array of components instead!

  ```ts
    fromChildrenOutput<
      TChildren extends object[],
      TUnionOutput extends PickUnionOutput<TChildren>,
      TUnionOutputName extends keyof TUnionOutput
    >(
      childrenSelector: () => TChildren | undefined,
      outputName: TUnionOutputName,
      { buildNotifier }: { buildNotifier?: ObservableInput<any> } = {}
    ): Observable<readonly [output: TUnionOutput[TUnionOutputName], index: number]>
  ```

  See [PickOutput](./src/lib/utils/pick-output.type.ts)</summary> utility type

  | argument           | type                                       | description                                                                                                                                                                                                                                                                                                                                     |
  | ------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `childrenSelector` | `() => TChildren \| undefined`             | A callback function used to get the child element to listen an event to.                                                                                                                                                                                                                                                                        |
  | `outputName`       | `TOutputName`                              | The name of the public observable to listen.                                                                                                                                                                                                                                                                                                    |
  | `options`          | `{ buildNotifier?: ObservableInput<any> }` | Optional. Default is `{}`.<br/>The option `buildNotifier` is a notifier to rebuild the inner `fromEvent` based on a custom notifier. It's usefull for an element destruction with an `NgIf` for example, or if it's used outside of an inject context (it uses `NgZone` as a default notifier, until the signal based components get realised). |

    <br/>

  Example:

  ```ts
  @Component({
    selector: 'app-child',
    template: `<button (click)="say.emit('hello!')">Say hello</button>`,
  })
  class AppChildComponent {
    // @Output is not necessary here, if you don't use the angular (eventName)="doSomething()" syntax
    // 'sayHello' must be public to be accessed
    say = new EventEmitter<string>();
  }

  @Component({
    selector: 'app-child2',
    template: `<button (click)="say.emit('goodbye!')">Say goodbye</button>`,
  })
  class AppChild2Component {
    say = new EventEmitter<string>();

    say$ = this.say.asObservablee(); // This won't be available as the second arguement `outputName` of `fromChildrenOutput` since it does not exist on `AppChildComponent`
  }

  @Component({
    selector: 'app-root',
    imports: [AppChildComponent, AppChild2Component],
    template: `
      <app-child #child />

      <app-child2 #child2 />
    `,
  })
  export class AppComponent {
    @ViewChild('child') child!: AppChildComponent;
    // Since it takes an array of components, you can rebuild it in your own way
    @ViewChild('child2') child2!: AppChild2Component;

    constructor() {
      // The second argument is infered from the child as the childSelector
      fromChildrenOutput(() => [this.child, this.child2], 'say').subscribe(console.log);
      // On child button click => Output: ["hello!", 0]
    }
  }
  ```
