import { ExistingProvider } from '@angular/core';
import { NG_ASYNC_VALIDATORS } from '@angular/forms';
import { CVAFeature } from './cva.type';

export function withAsyncValidator(existing?: ExistingProvider['useExisting']): CVAFeature {
  return (cvaExisting) => ({
    provide: NG_ASYNC_VALIDATORS,
    useExisting: existing ?? cvaExisting,
  });
}
