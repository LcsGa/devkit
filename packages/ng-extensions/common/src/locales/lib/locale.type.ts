import { Provider } from '@angular/core';

export type LocaleId = `${string}-${string}`;

export type LocaleFeature = (localeId: LocaleId) => Provider;
