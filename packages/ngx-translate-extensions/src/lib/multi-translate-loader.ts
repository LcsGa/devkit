import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { catchError, forkJoin, map, mergeAll, Observable, of, reduce } from 'rxjs';
import { TranslateResource } from './translation.type';

export class MultiTranslateLoader implements TranslateLoader {
  constructor(private readonly httpClient: HttpClient, private readonly resources: TranslateResource[]) {}

  public getTranslation(lang: string): Observable<unknown> {
    return forkJoin(
      this.resources.map(({ path, extension, namespace }) =>
        this.httpClient.get(`${[path, lang].join('/').replaceAll('//', '/')}${extension}`).pipe(
          catchError((err) => {
            console.error(err);
            return of(null);
          }),
          map((response) => ({ response, namespace }))
        )
      )
    ).pipe(
      mergeAll(),
      reduce(
        (translations, { response, namespace }) => ({
          ...translations,
          [namespace?.toUpperCase() || 'APP']: response,
        }),
        {}
      )
    );
  }
}
