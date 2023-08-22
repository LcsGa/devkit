import { registerLocaleData } from '@angular/common';
import { APP_INITIALIZER, LOCALE_ID, Provider } from '@angular/core';
import { LocaleFeature, LocaleId } from './locale.type';

type LocaleIdFn = (navigatorLanguage: LocaleId) => LocaleId;

type LocaleData = Parameters<typeof registerLocaleData>[0];

export function provideLocale(
  localeIdOrLocaleIdFnOrAuto: LocaleId | LocaleIdFn | 'auto',
  localeData?: LocaleData,
  ...features: LocaleFeature[]
): Provider[] {
  const navigatorLanguage = navigator.language as LocaleId;
  const localeId =
    localeIdOrLocaleIdFnOrAuto === 'auto'
      ? navigatorLanguage
      : typeof localeIdOrLocaleIdFnOrAuto === 'function'
      ? localeIdOrLocaleIdFnOrAuto(navigatorLanguage)
      : localeIdOrLocaleIdFnOrAuto;

  const localeProviders: Provider[] = [
    {
      provide: LOCALE_ID,
      useValue: localeId,
    },
  ];

  if (localeData) {
    localeProviders.push({
      provide: APP_INITIALIZER,
      multi: true,
      useValue: () => registerLocaleData(localeData),
    });
  }

  if (features.length) {
    const featureProviders = features.reduce<Provider[]>((providers, feature) => [...providers, feature(localeId)], []);
    localeProviders.push(featureProviders);
  }

  return localeProviders;
}
