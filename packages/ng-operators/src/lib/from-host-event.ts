import { ElementRef, assertInInjectionContext, inject } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export const fromHostEvent = <T extends Event>(
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions & { host?: ElementRef } = {}
): Observable<T> => {
  let _host: ElementRef;

  if (options.host) {
    _host = options.host;
  } else {
    assertInInjectionContext(fromHostEvent);
    _host = inject(ElementRef);
  }

  return fromEvent<T>(_host.nativeElement, type, options);
};
