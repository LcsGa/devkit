import { ElementRef } from '@angular/core';
import { Observable, filter, fromEvent } from 'rxjs';

export const fromChildrenEvent = <T extends Event>(
  childrenSelector: () => ElementRef[],
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions = {}
): Observable<T> =>
  fromEvent<T>(document, type, options).pipe(
    filter(({ target }) =>
      childrenSelector()
        .map(({ nativeElement }) => nativeElement)
        .includes(target)
    )
  );
