import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { debounceMap } from '../debounce-map';

describe('debounceTimeMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('should map-and-flatten each item debounced by a specified cold observable', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      // given
      const source$ = cold('--a---b-c--|', { a: 1, b: 2, c: 3 });
      const t = cold('        --x       ');
      //                          --x
      //                            --x

      // then
      const expected = '    ----a-----c|';
      const values = { a: 6, c: 8 };
      expectObservable(
        source$.pipe(
          debounceMap(
            (nb) => of(nb + 5),
            () => t
          )
        )
      ).toBe(expected, values);
    });
  });
});
