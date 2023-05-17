/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, NgZone } from '@angular/core';
import { ObservableInput, Observable, from, observeOn, asyncScheduler, switchMap, EMPTY } from 'rxjs';
import { PickOutput } from './utils/pick-output.type';

export const fromChildOutput = <
  TChild extends object,
  TOutput extends PickOutput<TChild>,
  TOutputName extends keyof TOutput
>(
  childSelector: () => TChild | undefined,
  outputName: TOutputName,
  { buildNotifier }: { buildNotifier?: ObservableInput<any> } = {}
): Observable<TOutput[TOutputName]> => {
  const ngZone = !buildNotifier ? inject(NgZone) : undefined;

  return (buildNotifier ? from(buildNotifier).pipe(observeOn(asyncScheduler)) : ngZone?.onMicrotaskEmpty ?? EMPTY).pipe(
    switchMap(() => {
      const child = childSelector() as unknown as TOutput;
      return child ? (child[outputName] as Observable<TOutput[TOutputName]>) : EMPTY;
    })
  );
};
