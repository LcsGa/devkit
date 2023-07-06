# @lcsga/operators

## Breaking changes:

### v3.0.0

- `bufferWhile` now puts the value at the moment when the predicate returns false, as the first element of the incoming new buffer, since _while_ is an exclusive keyword. Also doing so mimics the `takeWhile` operator behavior that is also exclusive.
- In the `predicate` of `bufferWhile`, `index` now represents the i-th source emission that has happened since the subscription`.

### v2.0.0

- `bufferWhile` now integrates the value at the moment when the predicate returns false, as the last element of the ongoing buffer, to mimic all of the already existing `bufferXxx` operators.

<br />

### This package provides a set of custom RxJS operators, to extend the list of already built-in ones.

- [debounceTimeMap](./src/lib/debounce-time-map.ts): This operator extends the familly of of `switchMap`, `mergeMap`, `concatMap` and `exhaustMap`.

  ```ts
  debounceTimeMap<TValue, TObservableInput extends ObservableInput<any>>(
    project: (value: TValue, index: number) => TObservableInput,
    dueTime: number
  ): OperatorFunction<TValue, ObservedValueOf<TObservableInput>>
  ```

  | argument  | type                                                 | description                                                                                                                                            |
  | --------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `project` | `(value: TValue, index: number) => TObservableInput` | A function that, when applied to an item emitted by the source Observable, returns an Observable.                                                      |
  | `dueTime` | `number`                                             | The timeout duration in milliseconds, for the window of time required to wait for emission silence before emitting the most recent inner source value. |

  <br/>

  <details>
  <summary>Why do we need it?</summary>

  Here is a use case you could easily encounter yourself:

  You made a searchbar and you'd like to send a fetch request, while typing within it.

  To avoid sending many requests at the same time (possibly causing an issue, receiving the first response after the second one for example) you would need to cancel the previous one by using a [switchMap](https://rxjs.dev/api/index/function/switchMap).

  Another great thing you could and should do is, before sending any request, wait for a certain amount of time with no more input. To do so, you could use a [debounceTime](https://rxjs.dev/api/index/function/debounceTime).

  <br/>

  #### Example:

  ```html
  <input type="text" placeholder="Github username" />
  ```

  ```ts
  const input = document.querySelector<HTMLInputElement>('input');

  fromEvent<GithubUser>(input, 'keydown')
    .pipe(
      debounceTime(300),
      switchMap(() => fromFetch('https://api.github.com/users/' + input.value, { selector: (res) => res.json() }))
    )
    .subscribe(console.log);
  ```

  With those two operators, everything works as expected... or not!

  What happens if your timing is bad and you press another set of key, with the first one pressed after **301ms**, then the others **under 300ms each**?

  **=> You will never go through the `switchMap` for a second time, as you could expect, which means that the previous request won't be canceled!**

  <br />

  **Here comes the `debounceTimeMap` custom operator to the rescue!**

  As you could probably guess, it simply is a combination of a `debounceTime` **and** a `switchMap`.
  </details>

  <br/>

  #### Example:

  ```html
  <input type="text" placeholder="Github username" />
  ```

  ```ts
  const input = document.querySelector<HTMLInputElement>('input');

  fromEvent<GithubUser>(input, 'keydown')
    .pipe(debounceTimeMap(() => fromFetch('https://api.github.com/users/' + input.value, { selector: (res) => res.json() }), 300))
    .subscribe(console.log);
  ```

  In the example above, if you are unlucky and press another key a little **after 300ms**, after a first request has been sent already, the previous request will still be canceled and you won't face any unexpected behavior!

<br/>

- [debounceMap](./src/lib/debounce-map.ts): It works exactly like `debounceTimeMap` but with a `durationSelector` instead of a `dueTime`!

  ```ts
  debounceMap<TValue, TObservableInput extends ObservableInput<any>>(
    project: (value: TValue, index: number) => TObservableInput,
    durationSelector: (value: TValue) => ObservableInput<any>
  ): OperatorFunction<TValue, ObservedValueOf<TObservableInput>>
  ```

  | argument           | type                                                 | description                                                                                                                                                    |
  | ------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `project`          | `(value: TValue, index: number) => TObservableInput` | A function that, when applied to an item emitted by the source Observable, returns an Observable.                                                              |
  | `durationSelector` | `(value: TValue) => ObservableInput<any>`            | A function that receives a value from the source Observable, for computing the timeout duration for each source value, returned as an Observable or a Promise. |

  <br/>

  #### Example:

  ```ts
  fromEvent<GithubUser>(input, 'keydown')
    .pipe(
      debounceMap(
        () => fromFetch('https://api.github.com/users/' + input.value, { selector: (res) => res.json() }),
        () => timer(300)
      )
    )
    .subscribe(console.log);
  ```

  <br/>

  - [bufferWhile](./src/lib/buffer-while.ts): Buffers the source Observable values until the `predicates` turns false.

  ```ts
  bufferWhile<T>(predicate: (value: T, index: number) => boolean, inclusive: boolean = false): OperatorFunction<T, T[]>
  ```

  | argument    | type                                   | description                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
  | ----------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `predicate` | `(value: T, index: number) => boolean` | A function that evaluates each value emitted by the source Observable.<br />Until the predicate returns `false` the buffer is updated with each incomming values. When it returns false the buffer is emitted, with the last value, to the output Observable, before being reset for the next ongoing values.<br />The `index` parameter is the number `i` for the i-th source emission that has happened since the subscription, starting from the number `0`. |
  | `inclusive` | `boolean`                              | Optional. Default is `false`.<br />When set to true the value that caused `predicate` to return `false` will also be buffered.                                                                                                                                                                                                                                                                                                                                  |

  <br />

### Example:

```ts
const source$ = of(1, 2, 3, 4, 5, 6);
const predicate = (nb) => nb !== 4;

// exclusive (default)
source$.pipe(bufferWhile(predicate)).subscribe(console.log);
// Outputs:
// [1, 2, 3]
// [4, 5, 6]

// inclusive
source$.pipe(bufferWhile(predicate, true)).subscribe(console.log);
// Outputs:
// [1, 2, 3, 4]
// [5, 6]
```
