import { Injector, afterNextRender, assertInInjectionContext } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

export function rxAfterNextRender(injector?: Injector): Observable<void> {
  const nextRender$$ = new ReplaySubject<void>(1);

  if (!injector) assertInInjectionContext(rxAfterNextRender);
  const nextRenderRef = afterNextRender(
    () => {
      nextRender$$.next();
      nextRender$$.complete();
      nextRenderRef.destroy();
    },
    { injector }
  );

  return nextRender$$.asObservable();
}
