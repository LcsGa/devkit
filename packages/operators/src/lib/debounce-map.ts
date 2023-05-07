/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObservableInput, ObservedValueOf, OperatorFunction, from, switchMap } from 'rxjs';

export const debounceMap = <TValue, TObservableInput extends ObservableInput<any>>(
  project: (value: TValue, index: number) => TObservableInput,
  durationSelector: (value: TValue) => ObservableInput<any>
): OperatorFunction<TValue, ObservedValueOf<TObservableInput>> =>
  switchMap((value, index) => from(durationSelector(value)).pipe(switchMap(() => project(value, index))));
