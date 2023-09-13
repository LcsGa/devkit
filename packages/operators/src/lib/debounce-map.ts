/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObservableInput, ObservedValueOf, OperatorFunction, from, switchMap, take } from 'rxjs';

export function debounceMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  durationSelector: (value: T) => ObservableInput<any>
): OperatorFunction<T, ObservedValueOf<ObservableInput<R>>> {
  return switchMap((value, index) =>
    from(durationSelector(value)).pipe(
      take(1),
      switchMap(() => project(value, index))
    )
  );
}
