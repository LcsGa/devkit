import { EMPTY, map, merge, Observable, switchMap } from 'rxjs';
import { rxAfterRender } from './rx-after-render';
import { InjectorOption, PickUnionOutput } from './types';

export function fromChildrenOutput<
  TChildren extends object[],
  TUnionOutput extends PickUnionOutput<TChildren>,
  TUnionOutputName extends keyof TUnionOutput
>(
  childrenSelector: () => TChildren | undefined,
  outputName: TUnionOutputName,
  options: InjectorOption = {}
): Observable<readonly [output: TUnionOutput[TUnionOutputName], index: number]> {
  return rxAfterRender(options.injector).pipe(
    switchMap(() => {
      const children = childrenSelector() as unknown[] as TUnionOutput[];
      return children
        ? merge(
            ...children.map((child, index) =>
              (child[outputName] as Observable<TUnionOutput[TUnionOutputName]>).pipe(map((output) => [output, index] as const))
            )
          )
        : EMPTY;
    })
  );
}
