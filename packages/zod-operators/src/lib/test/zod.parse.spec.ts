import { catchError } from "rxjs";
import { RunHelpers, TestScheduler } from "rxjs/testing";
import { z } from "zod";
import { zodParse } from '../zod-parse';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email()
});
type User = z.infer<typeof UserSchema>;

describe('zodParse', () => {
  let testScheduler: TestScheduler;

  const setup = <T extends Record<string, unknown>>(
    cold: RunHelpers['cold'],
    { strict = false, userTransform }: { strict?: boolean, userTransform?: (user: User) => T } = {}
  ) => {
    const baseUser: User = {
      name: 'LcsGa',
      email: 'lcsga@test.com',
      password: 'test123'
    } as User;
    const user = userTransform ? userTransform(baseUser) : baseUser;

    return {
      user,
      source$: cold('--u|  ', { u: user as User }).pipe(zodParse(UserSchema, { strict })),
      expected: '    --u|  ',
      caught: '      --(c|)' 
    } as const
  };

  const partialUser = ({ name }: User) => ({ name });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('should parse the incomming data', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      // given
      const { user, source$, expected } = setup(cold);

      // then
      const parsedUser = { u: { ...user, password: undefined } };
      expectObservable(source$).toBe(expected, parsedUser);
    })
  });

  it('should not be able to parse the incomming data', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      // given
      const { user: u, source$, expected } = setup(cold, { userTransform: partialUser });

      // then
      expectObservable(source$).toBe(expected, { u });
    })
  });

  it('should not be able to parse the incomming data and throw an (caught) error', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      // given
      const { source$, caught } = setup(cold, { strict: true, userTransform: partialUser });

      // then
      expectObservable(source$.pipe(catchError(() => 'c'))).toBe(caught);
    })
  });
});