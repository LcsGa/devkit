import { ObservableInput, ObservedValueOf, OperatorFunction, switchMap, timer } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounceTimeMap = <TValue, TObservableInput extends ObservableInput<any>>(
  project: (value: TValue, index: number) => TObservableInput,
  dueTime: number
): OperatorFunction<TValue, ObservedValueOf<TObservableInput>> =>
  switchMap((value, i) => timer(dueTime).pipe(switchMap(() => project(value, i))));
