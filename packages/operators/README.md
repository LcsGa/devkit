# @lcsga/operators

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

  To avoid sending many request at the same time (possibly causing an issue, receiving the first response after the second one for example) you would need to cancel the previous one by using a [switchMap](https://rxjs.dev/api/index/function/switchMap).

  Another great thing you could and should do is, before sending any request, wait for a certain amount of time. To do so, you could use a [debounceTime](https://rxjs.dev/api/index/function/debounceTime).

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

  **=> You will never go through the `switchMap`, which means that the previous request won't be cancelled!**

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
    .pipe(
      debounceTimeMap(
        () => fromFetch('https://api.github.com/users/' + input.value, { selector: (res) => res.json() }),
        300
      )
    )
    .subscribe(console.log);
  ```

  In the example above, if you are unlucky and press another key a little **after 300ms**, after a first request has been sent, the previous request will still be cancelled and you won't face any strange behavior!

<br/>

- [debounceMap](./src/lib/debounce-map.ts): It works exactly like `debounceTimeMap` but with a `durationSelector` instead of a `dueTime`!

  ```ts
  debounceTimeMap<TValue, TObservableInput extends ObservableInput<any>>(
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
