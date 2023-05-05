import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { SafeParseSuccess, ZodSchema } from 'zod';

let zodParseCount = 0;

export const zodParse = <T>(
  schema: ZodSchema<T>,
  options: { strict: boolean } = { strict: false }
): MonoTypeOperatorFunction<T> => {
  const zodParseIndex = ++zodParseCount;

  return (source$: Observable<T>) =>
    new Observable<T>((subscriber) =>
      source$.subscribe({
        next: (value) => {
          const parsedValue = schema.safeParse(value);

          console.group(schema.description ?? `zodParse#${zodParseIndex}`);

          if (parsedValue.success) {
            subscriber.next((parsedValue as SafeParseSuccess<T>).data);
          } else {
            if (options.strict) {
              subscriber.error(parsedValue.error);
            } else {
              console.warn(parsedValue.error);
              subscriber.next(value);
            }
          }

          console.groupEnd();
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      })
    );
};
