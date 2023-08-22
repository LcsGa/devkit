import { Injector } from '@angular/core';
import { EventListenerOptions } from 'rxjs/internal/observable/fromEvent';

export type InjectorOption = {
  injector?: Injector;
};

export interface NgEventListenerOptions extends EventListenerOptions {
  injector?: Injector;
}
