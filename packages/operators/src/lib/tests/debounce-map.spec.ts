import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { debounceMap } from '../debounce-map';

describe('debounceTimeMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('should map-and-flatten each item debounced by a specified cold observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      // given
      const source$ = cold('--a---bc--|', { a: 1, b: 2, c: 3 });
      const sourceSub = '   ^---------!';
      const t = cold('        --x      ');
      //                          --x
      //                           --x
      const tSubs = [
        '                   --^-!      ',
        '                   ------^!   ',
        '                   -------^-! '
      ];

      // then
      const expected = '    ----a----c|';
      const values = { a: 6, c: 8 };
      expectObservable(
        source$.pipe(debounceMap((nb) => of(nb + 5), () => t))
      ).toBe(expected, values);
      expectSubscriptions(source$.subscriptions).toBe(sourceSub);
      expectSubscriptions(t.subscriptions).toBe(tSubs);
    });
  });
});
