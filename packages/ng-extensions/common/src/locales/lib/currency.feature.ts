import { CurrencyPipe } from '@angular/common';
import { DEFAULT_CURRENCY_CODE } from '@angular/core';
import { LocaleFeature } from './locale.type';

type CurrencyCode = NonNullable<Parameters<CurrencyPipe['transform']>[1]>;

export function withCurrency(currencyCode: CurrencyCode): LocaleFeature {
  return () => ({ provide: DEFAULT_CURRENCY_CODE, useValue: currencyCode });
}
