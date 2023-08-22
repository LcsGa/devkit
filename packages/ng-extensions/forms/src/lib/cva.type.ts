import { ExistingProvider, Provider } from '@angular/core';

export type CVAFeature = (existing: ExistingProvider['useExisting']) => Provider;
