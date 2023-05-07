import { ElementRef } from '@angular/core';
import { Observable, filter, fromEvent } from 'rxjs';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export const fromChildEvent = <T extends Event>(
  childSelector: () => ElementRef,
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions = {}
): Observable<T> =>
  fromEvent<T>(document, type, options).pipe(filter(({ target }) => target === childSelector().nativeElement));
