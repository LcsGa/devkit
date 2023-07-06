import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { debounceTimeMap } from '../debounce-time-map';

describe('debounceTimeMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('should map-and-flatten each item debounced by 2 time units to an observable', () => {
    testScheduler.run(({ cold, time, expectObservable }) => {
      // given
      const source$ = cold('--a---b-c--|', { a: 1, b: 2, c: 3 });
      const t = time('      --|');

      // then
      const expected = '   ----a-----c|';
      const values = { a: 6, c: 8 };
      expectObservable(source$.pipe(debounceTimeMap((nb) => of(nb + 5), t))).toBe(expected, values);
    });
  });
});
