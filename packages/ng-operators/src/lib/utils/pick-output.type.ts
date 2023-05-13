/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';

export type PickOutput<TComponent extends object> = {
  [Key in keyof TComponent as TComponent[Key] extends Observable<any>
    ? Key
    : never]: TComponent[Key] extends Observable<infer TOutput> ? TOutput : never;
};
