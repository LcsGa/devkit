/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NgZone, assertInInjectionContext, inject } from '@angular/core';
import { EMPTY, Observable, ObservableInput, asyncScheduler, from, fromEvent, observeOn, switchMap } from 'rxjs';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export const fromChildEvent = <T extends Event>(
  childSelector: () => ElementRef | undefined,
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions & { buildNotifier?: ObservableInput<any> } = {}
): Observable<T> => {
  let build$: ObservableInput<any>;

  if (options.buildNotifier) {
    build$ = from(options.buildNotifier).pipe(observeOn(asyncScheduler));
  } else {
    assertInInjectionContext(fromChildEvent);
    build$ = inject(NgZone).onMicrotaskEmpty;
  }

  return build$.pipe(
    switchMap(() => {
      const child = childSelector()?.nativeElement;
      return child ? fromEvent<T>(child, type, options) : EMPTY;
    })
  );
};
