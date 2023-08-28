import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, importProvidersFrom, inject, makeEnvironmentProviders } from '@angular/core';
import { LocaleFeature, LocaleId } from '@lcsga/ng-extensions/common/locales';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { MultiTranslateLoader } from './multi-translate-loader';
import { TranslateResource } from './translation.type';

export function withNgxTranslate(translateResources: TranslateResource[]): LocaleFeature {
  return (locale: LocaleId) =>
    makeEnvironmentProviders([
      importProvidersFrom(
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => new MultiTranslateLoader(inject(HttpClient), translateResources),
          },
        })
      ),
      {
        provide: APP_INITIALIZER,
        useFactory: (): (() => Observable<unknown>) => {
          const translateService = inject(TranslateService);
          translateService.setDefaultLang(locale);

          return () => translateService.use(locale);
        },
        multi: true,
      },
    ]);
}
