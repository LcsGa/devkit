import { ObservableInput, ObservedValueOf, OperatorFunction, switchMap, timer } from 'rxjs';

/**
 * *Extends the family of `switchMap`, `mergeMap`, `concatMap` and `exhaustMap`*
 *
 * Projects each source value to an Observable which is merged in the output
 * Observable, only after a particular time span has passed without another
 * source emission.
 *
 * @example
 * ```ts
 * const addFive = (value) => of(value + 5);
 *
 * ```
 * ```text
 *           30ms           180ms  250ms
 *            |              |      |
 *  input: --[1]------------[2]----[3]------------->
 *         vvvv debounceTimeMap(addFive, 100ms) vvvv
 * output: -----------[6]-------------------[8]---->
 *            |- +100 -|            |- +100 -|
 *                    130ms                 350ms
 *
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounceTimeMap = <TValue, TObservableInput extends ObservableInput<any>>(
  project: (value: TValue, index: number) => TObservableInput,
  dueTime: number
): OperatorFunction<TValue, ObservedValueOf<TObservableInput>> =>
  switchMap((value, i) => timer(dueTime).pipe(switchMap(() => project(value, i))));
