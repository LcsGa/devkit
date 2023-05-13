/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NgZone, inject } from '@angular/core';
import { EMPTY, Observable, ObservableInput, asyncScheduler, from, fromEvent, observeOn, switchMap } from 'rxjs';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export const fromChildEvent = <T extends Event>(
  childSelector: () => ElementRef | undefined,
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
      const child = childSelector()?.nativeElement;
      return child ? fromEvent<T>(child, type, options) : EMPTY;
    })
  );
};
