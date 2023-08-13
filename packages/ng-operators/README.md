# @lcsga/ng-operators

## Breaking changes:

### v5.0.0

- The `fromChildEvent`, `fromChildrenEvent`, `fromChildOuptut` and `fromChildrenOutput` `buildNotifier` options are now replaced with `injector`
- The `fromHostEvent` `host` option is now replaced with `injector`

### v4.0.0

- `fromChildrenEvent` now returns an `Observable<readonly [event: Event, index: number]>`

### v3.0.0

- update angular to v16 (will throw a nice error message if it's called without access to `inject`)

### v2.0.0

- `fromChildEvent` and `fromChildrenEvent` must now be used in an injection context (or you can now provide a new `buildNotifier` option if needed).

<br/>

### This package provides a set of custom RxJS operators, used to make declarative pattern easier to set up within an angular app.

<br/>

## Getting started

### Installation

`@lcsga/ng-operators` is available for download at [npm](https://www.npmjs.com/package/@lcsga/ng-operators).

```sh
npm install @lcsga/ng-operators
```

### Configuration

To work as expected, this library needs the `NgZone` configuration to enable the event coalescing:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
  ],
};
// You can also activate the runCoalescing option alongside with the OnPush detection strategy to provide better performances of your apps
```

<br/>

## Documentation

### Table des matières

- [fromChildEvent](#fromchildevent)
- [fromChildrenEvent](#fromchildrenevent)
- [fromHostEvent](#fromhostevent)
- [fromChildOutput](#fromchildoutput)
- [fromChildrenOutput](#fromchildrenoutput)
- [rxAfterNextRender](#rxafternextrender)
- [rxAfterRender](#rxafterrender)

#### [fromChildEvent](./src/lib/from-child-event.ts)

This operator is usefull whenever you want to listen to some `@ViewChild` or `@ContentChild` events.

```ts
fromChildEvent<T extends Event>(
  childSelector: () => ElementRef | undefined,
  type: keyof HTMLElementEventMap,
  options?: NgEventListenerOptions
): Observable<T>
```

| argument        | type                            | description                                                                                                                                           |
| --------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childSelector` | `() => ElementRef \| undefined` | A callback function used to get the child element to listen an event to.                                                                              |
| `type`          | `keyof HTMLElementEventMap`     | The type of event to listen.                                                                                                                          |
| `options`       | `NgEventListenerOptions`        | Optional. Default is `{}`.<br/>Options to pass through to the underlying `addEventListener` function or if you need to manualy provide the `injector` |

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

##### Example:

```ts
@Component({
  selector: 'app',
  template: '<button #button>Click me!</button>',
})
export class AppComponent {
  @ViewChild('button')
  private readonly button?: ElementRef<HTMLButtonElement>;

  private readonly onButtonClick$ = fromChildEvent(() => this.button, 'click').pipe(tap(() => console.log('hello world!')));

  constructor() {
    this.onButtonClick$.subscribe();
  }
}
```

As you can see, `fromChildEvent` takes a selector callback to get the viewChild or contentChild target.

Since the document's event can only be fired after the dom is rendered, we know that the element passed within the selector callback is always available.

<br/>

#### [fromChildrenEvent](./src/lib/from-children-event.ts)

It works exactly like `fromChildEvent` but with `@ViewChildren` or `@ContentChildren` instead!

```ts
  fromChildrenEvent<T extends Event>(
    childrenSelector: () => ElementRef[] | undefined,
    type: keyof HTMLElementEventMap,
    options?: NgEventListenerOptions
  ): Observable<readonly [event: T, index: number]>
```

| argument           | type                              | description                                                                                                                                           |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `childrenSelector` | `() => ElementRef[] \| undefined` | A callback function used to get the children elements to listen an event to.                                                                          |
| `type`             | `keyof HTMLElementEventMap`       | The type of event to listen.                                                                                                                          |
| `options`          | `NgEventListenerOptions`          | Optional. Default is `{}`.<br/>Options to pass through to the underlying `addEventListener` function or if you need to manualy provide the `injector` |

    <br/>

##### Example:

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

  private readonly onButtonsClick$ = fromChildrenEvent(() => this.buttons?.toArray(), 'click').pipe(tap(() => console.log('hello world!')));

  constructor() {
    this.onButtonsClick$.subscribe();
  }
}
```

  <br/>

#### [fromHostEvent](./src/lib/from-host-event.ts)

This operator is usefull as an Rx replacement for `@HostListner`.

```ts
  fromHostEvent<T extends Event>(type: keyof HTMLElementEventMap, options?: NgEventListenerOptions): Observable<T>
```

| argument  | type                        | description                                                                                                                                           |
| --------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | `keyof HTMLElementEventMap` | The type of event to listen.                                                                                                                          |
| `options` | `NgEventListenerOptions`    | Optional. Default is `{}`.<br/>Options to pass through to the underlying `addEventListener` function or if you need to manualy provide the `injector` |

  <br/>

##### Example:

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

#### [fromChildOutput](./src/lib/from-child-output.ts)

This operator is usefull whenever you want to listen to some `@ViewChild` or `@ContentChild` outputs or observables for a `Component` or a `Directive` instead of an `ElementRef`.

```ts
  fromChildOutput<TChild extends object, TOutput extends PickOutput<TChild>, TOutputName extends keyof TOutput>(
    childSelector: () => TChild | undefined,
    outputName: TOutputName,
    options?: InjectorOption
  ): Observable<TOutput[TOutputName]>
```

See [PickOutput](./src/lib/utils/pick-output.type.ts)</summary> utility type

| argument        | type                        | description                                                                                          |
| --------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `childSelector` | `() => TChild \| undefined` | A callback function used to get the child element to listen an event to.                             |
| `outputName`    | `TOutputName`               | The name of the public observable to listen.                                                         |
| `options`       | `InjectorOption`            | Optional. Default is `{}`.<br/>Options to pass through if you need to manualy provide the `injector` |

    <br/>

##### Example:

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

#### [fromChildrenOutput](./src/lib/from-children-output.ts)

It works exactly like `fromChildOutput` but for an array of components instead!

```ts
  fromChildrenOutput<
    TChildren extends object[],
    TUnionOutput extends PickUnionOutput<TChildren>,
    TUnionOutputName extends keyof TUnionOutput
  >(
    childrenSelector: () => TChildren | undefined,
    outputName: TUnionOutputName,
    options?: InjectorOption
  ): Observable<readonly [output: TUnionOutput[TUnionOutputName], index: number]>
```

See [PickOutput](./src/lib/types/pick-output.type.ts)</summary> utility type

| argument           | type                           | description                                                                                          |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `childrenSelector` | `() => TChildren \| undefined` | A callback function used to get the child element to listen an event to.                             |
| `outputName`       | `TOutputName`                  | The name of the public observable to listen.                                                         |
| `options`          | `InjectorOption`               | Optional. Default is `{}`.<br/>Options to pass through if you need to manualy provide the `injector` |

    <br/>

##### Example:

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

  <br/>

#### [rxAfterNextRender](./src/lib/rx-after-next-render.ts)

It uses the new `afterNextRender` to send an RxJS notification that the callback function has been called once.

```ts
  rxAfterNextRender(injector?: Injector): Observable<void>
```

| argument   | type       | description                       |
| ---------- | ---------- | --------------------------------- |
| `injector` | `Injector` | Optional. Default is `undefined`. |

##### Example

```ts
@Component({
  selector: 'app',
  template: '<button #button>Click me!</button>',
})
export class AppComponent {
  @ViewChild('button')
  private readonly button?: ElementRef<HTMLButtonElement>;

  constructor() {
    rxAfterNextRender().subscribe(() => console.log(this.button?.clientHeight)); // the button won't be undefined here
  }
}
```

  <br/>

#### [rxAfterRender](./src/lib/rx-after-render.ts)

It uses the new `afterRender` to send RxJS notifications each time the callback function is called.

```ts
  rxAfterRender(injector?: Injector): Observable<void>
```

| argument   | type       | description                       |
| ---------- | ---------- | --------------------------------- |
| `injector` | `Injector` | Optional. Default is `undefined`. |

##### Example

```ts
@Component({
  selector: 'app',
  template: '<button #button>Click me!</button>',
})
export class AppComponent {
  @ViewChild('button')
  private readonly button?: ElementRef<HTMLButtonElement>;

  constructor() {
    rxAfterRender().subscribe(() => console.log(this.button?.clientHeight)); // Will log the button's clientHeight each time the view is checked by angular
  }
}
```

## What to expect in the future?

With the upcomming [Signal-based Components](https://github.com/angular/angular/discussions/49682), we shouldn't need to first declare `@ViewChild`, `@ViewChildren`, etc. anymore.-ml-1

This would greatly improve the DX of these operators and it could lead to the following improvements:

```ts
@Component({
  selector: 'app',
  template: '<button #button>Click me!</button>',
})
export class AppComponent {
  readonly onButtonClick$ = fromViewChildEvent('button', 'click').pipe(...)
}
```

```ts
@Component({
  selector: 'app',
  template: '<button mat-button>Click me!</button>',
})
export class AppComponent {
  readonly onButtonClick$ = fromViewChildEvent(MatButton, 'click').pipe(...)
}
```

```ts
@Component({
  selector: 'app',
  template: `
    <button #button1>Click me!</button>

    <button #button2>Click me too!</button>
  `,
})
export class AppComponent {
  readonly onButtonsClick$ = fromViewChildrenEvent(['button1', 'button2'], 'click').pipe(...)
  // of course, the 2 buttons could simply be named #button but it is for the example only
}
```

```ts
@Component({
  selector: 'app',
  template: `
    <button mat-button>Click me!</button>

    <button mat-button>Click me too!</button>
  `,
})
export class AppComponent {
  readonly onButtonClick$ = fromViewChildrenEvent(MatButton, 'click').pipe(...)
  // or could be fromViewChildren([MatButton, SomeOtherComponentOrDirective]).pipe(...);
}
```

| With SBCs, I could either decouple the `viewChild<ren>` and `contentChild<ren>` or try to merge them together.

<br/>

=> Another thing I might improve is merging `fromChild<ren>Event` and `fromChild<ren>Output` into one operator.
