import { ElementRef } from '@angular/core';
import { EMPTY, Observable, fromEvent, map, switchMap } from 'rxjs';
import { rxAfterRender } from './rx-after-render';
import { NgEventListenerOptions } from './types';

export function fromChildEvent<T extends Event>(
  childSelector: () => ElementRef | undefined,
  type: keyof HTMLElementEventMap,
  options: NgEventListenerOptions = {}
): Observable<T> {
  return rxAfterRender(options.injector).pipe(
    map((): HTMLElement | undefined => childSelector()?.nativeElement),
    switchMap((child) => (child ? fromEvent<T>(child, type, options) : EMPTY))
  );
}
