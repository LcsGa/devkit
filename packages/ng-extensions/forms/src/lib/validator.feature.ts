import { ExistingProvider } from '@angular/core';
import { NG_VALIDATORS } from '@angular/forms';
import { CVAFeature } from './cva.type';

export function withValidator(existing?: ExistingProvider['useExisting']): CVAFeature {
  return (cvaExisting) => ({
    provide: NG_VALIDATORS,
    useExisting: existing ?? cvaExisting,
  });
}
