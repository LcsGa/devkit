import { Injector, afterRender, assertInInjectionContext } from '@angular/core';
import { Observable, ReplaySubject, finalize } from 'rxjs';

export function rxAfterRender(injector?: Injector): Observable<void> {
  const render$$ = new ReplaySubject<void>(1);

  if (!injector) assertInInjectionContext(rxAfterRender);
  const renderRef = afterRender(() => render$$.next(), { injector });

  return render$$.pipe(
    finalize(() => {
      renderRef.destroy();
      render$$.complete();
    })
  );
}
