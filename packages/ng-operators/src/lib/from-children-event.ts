/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NgZone, assertInInjectionContext, inject } from '@angular/core';
import { EMPTY, Observable, ObservableInput, asyncScheduler, from, fromEvent, merge, observeOn, switchMap } from 'rxjs';

export const fromChildrenEvent = <T extends Event>(
  childrenSelector: () => ElementRef[] | undefined,
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions & { buildNotifier?: ObservableInput<any> } = {}
): Observable<T> => {
  let build$: ObservableInput<any>;

  if (options.buildNotifier) {
    build$ = from(options.buildNotifier).pipe(observeOn(asyncScheduler));
  } else {
    assertInInjectionContext(fromChildrenEvent);
    build$ = inject(NgZone).onMicrotaskEmpty;
  }

  return build$.pipe(
    switchMap(() => {
      const children = childrenSelector();
      return children
        ? merge(...children.map(({ nativeElement }) => fromEvent<T>(nativeElement, type, options)))
        : EMPTY;
    })
  );
};
