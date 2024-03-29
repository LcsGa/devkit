import { EMPTY, Observable, switchMap } from 'rxjs';
import { rxAfterRender } from './rx-after-render';
import { InjectorOption } from './types/ng-event-listener-options.type';
import { PickOutput } from './types/pick-output.type';

export function fromChildOutput<
  TChild extends object,
  TOutput extends PickOutput<TChild>,
  TOutputName extends keyof TOutput
>(
  childSelector: () => TChild | undefined,
  outputName: TOutputName,
  options: InjectorOption = {}
): Observable<TOutput[TOutputName]> {
  return rxAfterRender(options.injector).pipe(
    switchMap(() => {
      const child = childSelector() as unknown as TOutput;
      return child ? (child[outputName] as Observable<TOutput[TOutputName]>) : EMPTY;
    })
  );
}
