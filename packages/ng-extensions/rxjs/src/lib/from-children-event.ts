import { ElementRef } from '@angular/core';
import { EMPTY, Observable, fromEvent, map, merge, switchMap } from 'rxjs';
import { rxAfterRender } from './rx-after-render';
import { NgEventListenerOptions } from './types/ng-event-listener-options.type';

export function fromChildrenEvent<T extends Event>(
  childrenSelector: () => ElementRef[] | undefined,
  type: keyof HTMLElementEventMap,
  options: NgEventListenerOptions = {}
): Observable<readonly [event: T, index: number]> {
  return rxAfterRender(options.injector).pipe(
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
}
