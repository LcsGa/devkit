import { ExistingProvider, Provider } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CVAFeature } from './cva.type';

export function provideCVA(existing: ExistingProvider['useExisting'], ...features: CVAFeature[]): Provider[] {
  return [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: existing,
      multi: true,
    },
    existing,
    ...features.reduce<Provider[]>((providers, feature) => [...providers, feature(existing)], []),
  ];
}
