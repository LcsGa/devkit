/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NgZone, assertInInjectionContext, inject } from '@angular/core';
import {
  EMPTY,
  Observable,
  ObservableInput,
  asyncScheduler,
  from,
  fromEvent,
  map,
  merge,
  observeOn,
  switchMap,
} from 'rxjs';

export const fromChildrenEvent = <T extends Event>(
  childrenSelector: () => ElementRef[] | undefined,
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions & { buildNotifier?: ObservableInput<any> } = {}
): Observable<readonly [event: T, index: number]> => {
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
        ? merge(
            ...children.map(({ nativeElement }, index) =>
              fromEvent<T>(nativeElement, type, options).pipe(map((event) => [event, index] as const))
            )
          )
        : EMPTY;
    })
  );
};
