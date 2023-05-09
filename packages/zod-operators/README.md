# @lcsga/zod-operators

### This package provides a custom RxJS operator, used to empower the use of zod schemas alongside RxJS observables.

- [zodParse](./src/lib/zod-parse.ts): This operator is usefull to parse zod schemas within an RxJS stream, in order to check types at runtime.

  ```ts
  zodParse<T>(schema: ZodSchema<T>, options?: { strict?: boolean }): MonoTypeOperatorFunction<T>
  ```

  | argument  | type                  | description                                                                                                                                      |
  | --------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `schema`  | `ZodSchema<T>`        | The schema to provide for the parsing.<br/>A description can also be provided to improve the debugging by calling the `describe()` method to it. |
  | `options` | `{ strict: boolean }` | Optional. Default is `{}`.<br/>A configuration object to modify the behavior of the operator.                                                    |

  <br/>

  #### Example:

  ```ts
  const GithubUserSchema = z.object({
    id: z.string().uuid(),
    login: z.string(),
  });

  type GithubUser = z.infer<typeof GithubUserSchema>;

  fromFetch<GithubUser[]>('https://api.github.com/users?per_page=5', { selector: (res) => res.json() })
    .pipe(zodParse(GithubUserSchema.array()))
    .subscribe(console.log);
  ```

  Since the id of a Github user is of type `number` and since the `zodParse` operator is not strict by default, the `console.log` will return the object fetched without any parsing and the console will print the following warning:

  ```
  ZodError: [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": [
        0,
        "id"
      ],
      "message": "Expected string, received number"
    },
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": [
        1,
        "id"
      ],
      "message": "Expected string, received number"
    },
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": [
        2,
        "id"
      ],
      "message": "Expected string, received number"
    },
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": [
        3,
        "id"
      ],
      "message": "Expected string, received number"
    },
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": [
        4,
        "id"
      ],
      "message": "Expected string, received number"
    }
  ]
  ```

  If we want to throw an error instead of a simple warning, we can pass an `options` object as the second argument and set `strict` to `true`:

  ```ts
  fromFetch<GithubUser[]>('https://api.github.com/users?per_page=5', { selector: (res) => res.json() })
    .pipe(zodParse(GithubUserSchema.array(), { strict: true }))
    .subscribe(console.log);
  ```

  The error will be the same as in the warning above, but this time we won't receive any data in the `console.log`.
