/* eslint-disable @typescript-eslint/no-explicit-any */
import { Route } from '@angular/router';
import { Observable } from 'rxjs';

export type ExtractRoutePath<T extends Route> = T extends infer TRoute
  ? {
      [KeyPath in keyof TRoute as KeyPath extends 'path'
        ? TRoute[KeyPath] extends `${string}:${infer TPath}`
          ? TPath
          : never
        : never]: string;
    }
  : never;

export type ExtractRouteData<T extends Route> = T extends infer TRoute
  ? {
      [KeyData in keyof TRoute as KeyData extends 'data'
        ? keyof TRoute[KeyData]
        : never]: TRoute[KeyData][keyof TRoute[KeyData]];
    }
  : never;

export type ExtractRouteResolve<T extends Route> = T extends infer TRoute
  ? {
      [KeyResolve in keyof TRoute as KeyResolve extends 'resolve'
        ? keyof TRoute[KeyResolve]
        : never]: TRoute[KeyResolve][keyof TRoute[KeyResolve]] extends (...args: any[]) => infer TReturn
        ? TReturn extends Observable<infer TResolve> | Promise<infer TResolve> | infer TResolve
          ? TResolve
          : never
        : never;
    }
  : never;

type _ExtractRouteInputs<T extends Route> = ExtractRoutePath<T> & ExtractRouteData<T> & ExtractRouteResolve<T>;

export type ExtractRouterInputs<T extends Route> = {
  [Key in keyof _ExtractRouteInputs<T>]: _ExtractRouteInputs<T>[Key];
};
