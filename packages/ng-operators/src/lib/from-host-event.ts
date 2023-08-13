import { ElementRef, assertInInjectionContext, inject, runInInjectionContext } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { NgEventListenerOptions } from './types';

export function fromHostEvent<T extends Event>(type: keyof HTMLElementEventMap, options: NgEventListenerOptions = {}): Observable<T> {
  if (!options.injector) assertInInjectionContext(fromHostEvent);
  const host = options.injector ? runInInjectionContext(options.injector, () => inject(ElementRef)) : inject(ElementRef);

  return fromEvent<T>(host.nativeElement, type, options);
}
