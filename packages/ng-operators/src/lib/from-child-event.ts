import { ElementRef } from '@angular/core';
import { Observable, filter, fromEvent } from 'rxjs';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export const fromChildEvent = <TEvent extends Event>(
  childSelector: () => ElementRef,
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions = {}
): Observable<TEvent> =>
  fromEvent<TEvent>(document, type, options).pipe(filter(({ target }) => target === childSelector().nativeElement));
