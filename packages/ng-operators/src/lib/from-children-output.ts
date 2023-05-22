/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertInInjectionContext, inject, NgZone } from '@angular/core';
import { asyncScheduler, EMPTY, from, map, merge, Observable, ObservableInput, observeOn, switchMap } from 'rxjs';
import { PickUnionOutput } from './utils/pick-output.type';

export const fromChildrenOutput = <
  TChildren extends object[],
  TUnionOutput extends PickUnionOutput<TChildren>,
  TUnionOutputName extends keyof TUnionOutput
>(
  childrenSelector: () => TChildren | undefined,
  outputName: TUnionOutputName,
  { buildNotifier }: { buildNotifier?: ObservableInput<any> } = {}
): Observable<readonly [output: TUnionOutput[TUnionOutputName], index: number]> => {
  let build$: ObservableInput<any>;

  if (buildNotifier) {
    build$ = from(buildNotifier).pipe(observeOn(asyncScheduler));
  } else {
    assertInInjectionContext(fromChildrenOutput);
    build$ = inject(NgZone).onMicrotaskEmpty;
  }

  return build$.pipe(
    switchMap(() => {
      const children = childrenSelector() as unknown[] as TUnionOutput[];
      return children
        ? merge(
            ...children.map((child, index) =>
              (child[outputName] as Observable<TUnionOutput[TUnionOutputName]>).pipe(
                map((output) => [output, index] as const)
              )
            )
          )
        : EMPTY;
    })
  );
};
