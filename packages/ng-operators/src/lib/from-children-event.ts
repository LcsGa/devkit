/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NgZone, inject } from '@angular/core';
import { EMPTY, Observable, ObservableInput, asyncScheduler, from, fromEvent, merge, observeOn, switchMap } from 'rxjs';

export const fromChildrenEvent = <T extends Event>(
  childrenSelector: () => ElementRef[] | undefined,
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions & { buildNotifier?: ObservableInput<any> } = {}
): Observable<T> => {
  const ngZone = !options.buildNotifier ? inject(NgZone) : undefined;

  return (
    options.buildNotifier
      ? from(options.buildNotifier).pipe(observeOn(asyncScheduler))
      : ngZone?.onMicrotaskEmpty ?? EMPTY
  ).pipe(
    switchMap(() => {
      const children = childrenSelector();
      return children
        ? merge(...children.map(({ nativeElement }) => fromEvent<T>(nativeElement, type, options)))
        : EMPTY;
    })
  );
};
