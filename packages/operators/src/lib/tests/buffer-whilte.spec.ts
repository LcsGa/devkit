import { TestScheduler } from 'rxjs/testing';
import { bufferWhile } from '../buffer-while';

describe('bufferWhile', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('should buffer all elements of the source at completion', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      // given
      const numbers$ = cold('123456|');

      // then
      const expected = '     ------(a|)';
      const values = { a: ['1', '2', '3', '4', '5', '6'] };
      expectObservable(numbers$.pipe(bufferWhile(() => true))).toBe(expected, values);
    });
  });

  describe('excluding the element that made the predicate return false', () => {
    it('should buffer all elements up to the predicate returning false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const numbers$ = cold('123456|');

        // then
        const expected = '     ---a--(b|)';
        const values = {
          a: ['1', '2', '3'],
          b: ['4', '5', '6'],
        };
        expectObservable(numbers$.pipe(bufferWhile((nb) => nb !== '4'))).toBe(expected, values);
      });
    });

    it('should individually buffer each element of the source at completion', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const numbers$ = cold('123456|');

        // then
        const expected = '     zabcde(f|)';
        const values = { z: [], a: ['1'], b: ['2'], c: ['3'], d: ['4'], e: ['5'], f: ['6'] };
        expectObservable(numbers$.pipe(bufferWhile(() => false))).toBe(expected, values);
      });
    });
  });

  describe('including the element that made the predicate return false', () => {
    it('should buffer all elements up to the predicate returning false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const numbers$ = cold('123456|');

        // then
        const expected = '     ---a--(b|)';
        const values = {
          a: ['1', '2', '3', '4'],
          b: ['5', '6'],
        };
        expectObservable(numbers$.pipe(bufferWhile((nb) => nb !== '4', true))).toBe(expected, values);
      });
    });

    it('should individually buffer each element of the source at completion', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const numbers$ = cold('123456|');

        // then
        const expected = '     abcdef(z|)';
        const values = { a: ['1'], b: ['2'], c: ['3'], d: ['4'], e: ['5'], f: ['6'], z: [] };
        expectObservable(numbers$.pipe(bufferWhile(() => false, true))).toBe(expected, values);
      });
    });
  });
});
