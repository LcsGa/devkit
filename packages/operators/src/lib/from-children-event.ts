import { ElementRef } from '@angular/core';
import { Observable, filter, fromEvent } from 'rxjs';

export const fromChildrenEvent = <TEvent extends Event>(
  childrenSelector: () => ElementRef[],
  type: keyof HTMLElementEventMap,
  options: EventListenerOptions = {}
): Observable<TEvent> =>
  fromEvent<TEvent>(document, type, options).pipe(
    filter(({ target }) =>
      childrenSelector()
        .map(({ nativeElement }) => nativeElement)
        .includes(target)
    )
  );
