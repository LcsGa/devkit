import { ElementRef, inject } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export const fromHostEvent = <T extends Event>(
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions & { host?: ElementRef } = {}
): Observable<T> => {
  const hostEl = (options.host ?? inject(ElementRef)).nativeElement;
  return fromEvent<T>(hostEl, type, options);
};
