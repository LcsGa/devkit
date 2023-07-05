import { Observable, OperatorFunction } from 'rxjs';

export function bufferWhile<T, R extends T>(predicate: (value: T, index: number) => value is R): OperatorFunction<T, R[]>;
export function bufferWhile<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T[]>;

export function bufferWhile<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T[]> {
  return (source$: Observable<T>) =>
    new Observable((destination) => {
      let buffer: T[] = [];
      const emitBuffer = () => {
        destination.next(buffer);
        buffer = [];
      };
      return source$.subscribe({
        next: (value) => {
          buffer.push(value);
          if (!predicate(value, buffer.length - 1)) emitBuffer();
        },
        error: (err) => destination.error(err),
        complete: () => {
          emitBuffer();
          destination.complete();
        },
      });
    });
}
