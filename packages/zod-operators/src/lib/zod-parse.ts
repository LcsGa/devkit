import { Observable, OperatorFunction } from 'rxjs';
import { ZodType, ZodTypeDef } from 'zod';

let zodParseCount = 0;

export const zodParse = <TInput, TOutput>(
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
  options: { strict: boolean } = { strict: false }
): OperatorFunction<TInput, TOutput> => {
  const zodParseIndex = ++zodParseCount;

  return (source$: Observable<TInput>) =>
    new Observable((subscriber) =>
      source$.subscribe({
        next: (value) => {
          const description = `${schema.description ?? `Zod parsing #${zodParseIndex}`}`;
          const parsedValue = schema.safeParse(value);

          if (parsedValue.success) {
            subscriber.next(parsedValue.data);
          } else {
            if (options.strict) {
              subscriber.error(new Error(`${description}:\n\n${parsedValue.error.message}`));
            } else {
              console.warn(`${description}:\n\n`, parsedValue.error);
              subscriber.next(value as unknown as TOutput);
            }
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      })
    );
};
