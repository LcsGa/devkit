# @lcsga/ng-utils

## types

### This package provides a set utility types for angular.

<br/>

- [ExtractRouteInputs](https://github.com/LcsGa/devkit/blob/4d70cde222f09c58096a882f3f5e86abd49d816c/packages/ng-utils/types/src/lib/route-inputs.ts?plain=1#L37-L39): Extracts the route's **path parameters**, the **resolved values** and the **data values** to create an object type to implement in `@Component`s

  #### Example:

  ```ts
  // app.routes.ts

  const userRoute = {
    path: 'user/:id' as const,
    data: { someData: true },
    resolve: { user: () => of({ name: 'Lucas', age: 26 }).pipe(delay(500)) },
    loadComponent: () => import('./user.component'),
  } satisfies Route;

  export type UserRouteInputs = ExtractRouteInputs<typeof userRoute>;
  /* Output:
    {
      id: string:
      someData: boolean;
      user: {
        name: string;
        age: number;
      }
    }
  */

  export const routes: Routes = [userRoute];
  ```

  In the example above, we can see two import things to extract the route inputs:

  - the use of `{ ... } satisfies Route` instead of a basic `userRoute: Route` => this is really important to let typescript **infer** the type of `userRoute` but still **keeping autocompletion** and **type validation** during the development phase
  - the use of `as const` for the `path`: it helps typescript **infer** `'user/:id'` instead of `string` => it's necessary to extract `id` as the **path param input**

  <br/>

  This `ExtractRouteInputs` is composed of the flattened:

  - [ExtractRoutePath](https://github.com/LcsGa/devkit/blob/4d70cde222f09c58096a882f3f5e86abd49d816c/packages/ng-utils/types/src/lib/route-inputs.ts?plain=1#L5-L13)
  - [ExtractRouteData](https://github.com/LcsGa/devkit/blob/4d70cde222f09c58096a882f3f5e86abd49d816c/packages/ng-utils/types/src/lib/route-inputs.ts?plain=1#L15-L21)
  - [ExtractRouteResolve](https://github.com/LcsGa/devkit/blob/4d70cde222f09c58096a882f3f5e86abd49d816c/packages/ng-utils/types/src/lib/route-inputs.ts?plain=1#L23-L33)

  <br/>

  NB: Since query parameters are not declared in a **Route** we cannot extract them.
