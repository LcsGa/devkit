import { Observable, OperatorFunction } from 'rxjs';

export function bufferWhile<T, R extends T>(predicate: (value: T, index: number) => value is R): OperatorFunction<T, R[]>;
export function bufferWhile<T, R extends T>(
  predicate: (value: T, index: number) => value is R,
  inclusive: boolean
): OperatorFunction<T, R[]>;
export function bufferWhile<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T[]>;
export function bufferWhile<T>(predicate: (value: T, index: number) => boolean, inclusive: boolean): OperatorFunction<T, T[]>;

export function bufferWhile<T>(predicate: (value: T, index: number) => boolean, inclusive = false): OperatorFunction<T, T[]> {
  return (source$: Observable<T>) =>
    new Observable((destination) => {
      let buffer: T[] = [];
      let index = 0;

      const emitBuffer = (firstValue?: T) => {
        destination.next(buffer);
        buffer = firstValue ? [firstValue] : [];
      };

      return source$.subscribe({
        next: (value) => {
          if (predicate(value, index++)) {
            buffer.push(value);
          } else {
            if (inclusive) {
              buffer.push(value);
              emitBuffer();
            } else {
              emitBuffer(value);
            }
          }
        },
        error: (err) => destination.error(err),
        complete: () => {
          emitBuffer();
          destination.complete();
        },
      });
    });
}
