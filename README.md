# Nestjs Mongoose Boilerplate

> A simple nestjs boilerplate that includes the basic and crucial features to help start your project quickly.

## Features

- NestJS 12 (Express 5)
- Mongoose 9
- Zod validation for request DTOs and environment variables (Standard Schema)
- Config Service
- Swagger (request bodies are generated from the Zod schemas)
- Generate client routes from swagger endpoints
- Authentication
- Google oauth (optional, enabled by the `GOOGLE_*` variables)
- Access Control (CASL)
- Pagination Middleware
- Refresh and Access tokens
- Unit testing and E2E testing
- Seeder
- Github actions
- Docker
- K8S

## Requirements

- **Node.js 24 LTS** (recommended). The app itself runs on Node `^20.19.0 || >=22.12.0`, but:
  - the Nest CLI generators (`nest generate`, `nest upgrade`) need Node `22.22.3+`, `24.15+` or `26+`
  - the test scripts rely on Jest's native `require(esm)` support, which needs Node `24.9+`
- MongoDB

## Getting Started

To get a local copy up and running follow these steps.

### Installation

1. Click on use template and click new repository.

2. Navigate to the project directory.

   ```shell
   cd <repository_directory>
   ```

3. Create a `.env` file and populate it with the required environment variables provided in the `.env.example` file.

4. Install the dependencies.

   ```shell
   npm install
   ```

### Environment variables

The variables are validated on startup by the Zod schema in `src/config.type.ts`, and the app refuses to start if a required one is missing. `EnvConfig` is inferred from the same schema, so `ConfigService<EnvConfig>` is fully typed.

| Variable                   | Required | Default | Description                                     |
| -------------------------- | -------- | ------- | ----------------------------------------------- |
| `PORT`                     | no       | `3000`  | HTTP port                                       |
| `DB_URL`                   | yes      |         | MongoDB connection string                       |
| `ACCESS_SECRET`            | yes      |         | Secret used to sign access tokens               |
| `REFRESH_SECRET`           | yes      |         | Secret used to sign refresh tokens              |
| `ACCESS_TOKEN_EXPIRATION`  | yes      |         | Access token lifetime, e.g. `10m`               |
| `REFRESH_TOKEN_EXPIRATION` | yes      |         | Refresh token lifetime, e.g. `7d`               |
| `GOOGLE_CLIENT_ID`         | no       |         | Google OAuth client id (see Google login)       |
| `GOOGLE_CLIENT_SECRET`     | no       |         | Google OAuth client secret (see Google login)   |
| `GOOGLE_CALLBACK_URL`      | no       |         | Google OAuth callback url (see Google login)    |

### Validation (Zod)

DTOs are [Zod](https://zod.dev/) schemas. Each DTO file exports the schema and the TypeScript type inferred from it:

```ts
// src/modules/auth/dto/login.payload.ts
import { z } from 'zod';

export const loginSchema = z.strictObject({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type LoginPayload = z.infer<typeof loginSchema>;
```

Pass the schema to the route decorator with the `schema` option:

```ts
@Post('login')
login(@Body({ schema: loginSchema }) payload: LoginPayload) {
  // payload is already validated here
}
```

- The global `StandardSchemaValidationPipe` (registered in `main.ts`) validates every `@Body()`, `@Query()` and `@Param()` that declares a `schema`.
- `z.strictObject()` rejects unknown keys with a `400`. Use `z.object()` if you would rather strip them.
- Swagger reads the same schemas, so there is no need for `@ApiProperty()` on DTOs.

### Google login

Google login is optional. It is enabled only when `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_CALLBACK_URL` are all set. Otherwise a warning is logged on startup and `/api/auth/google` returns `404`.

1. Create an OAuth client ID of type "Web application" in the [Google Cloud console](https://console.cloud.google.com/apis/credentials).
2. Add `http://localhost:<port>/api/auth/google/redirect` as an authorized redirect URI and use the same value for `GOOGLE_CALLBACK_URL`.
3. Copy the client id and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Open `http://localhost:<port>/api/auth/google` in a browser to sign in. Google redirects back to `/api/auth/google/redirect`, which:

- creates the user on the first login (Google users have no password)
- sets the `access_token` and `refresh_token` cookies
- returns the tokens as JSON

### Query model usage

##### The querying system works by combining the searched field, operator, and the value. the format looks like following:

```shell
field-operator=value
```

For example:

```shell
https://url/?fullName-contains=lee
```

For a nested field use "." between the nested fields `user.fullName-contains=lee`

##### This only works if the field is not a reference, Im trying to figure out a way to apply it on reference fields as well.

#### Available operators and their equivalent in mongoose

```javascript

  ['equals', '$eq'],
  ['notEquals', '$ne'],
  ['lessThan', '$lt'],
  ['lessThanOrEqual', '$lte'],
  ['greaterThan', '$gt'],
  ['greaterThanOrEqual', '$gte'],
  ['in', '$in'],
  ['notIn', '$nin'],
  ['contains', '$regex'],
  ['notContains', '$not'],
```

Pagination uses the `page`, `limit`, `sort` and `sortBy` (`asc` | `desc`) query parameters and defaults to `page=1&limit=10&sort=createdAt&sortBy=desc`.

### Usage

To start the development server, run the following command:

```shell
npm run dev
```

The API is served under `http://localhost:<port>/api` and the Swagger UI under `http://localhost:<port>/api/docs`.

To start unit testing, run the following command:

```shell
npm run test
```

and to run E2E tests (they need a running MongoDB and the variables from `.env`):

```shell
npm run test:e2e
```

to run the seeder, pass how many users to generate as an argument (defaults to 10):

```shell
npm run seed -- 50
```

Seeders are registered in `SeederModule` (`src/seeder.module.ts`), which only `seed.ts` loads. That keeps them, and faker, out of the running app and the production image. Add new seeders there.

to generate the client routes from the swagger run:

```shell
npm run generate:api-client
```

this will run `npm run generate:swagger && openapi-generator-cli generate -i swagger.json -g typescript-fetch -o ./src/api-client`
adjust it to your needs for example if you dont want it to compile to `./src/api-client`

to run the Dockerfile:

```shell
docker compose up -d
```

to run the K8S, navigate to k8s directory and run:

```shell
kubectl apply -f backend-config.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f mongodb-deployment.yaml
```

ps: make sure you have a k8s cluster running, I use minikube.

The server should now be running at `http://localhost:<port>/api`. You can access the endpoints using a tool like Postman or any web browser.

## Upgrading from the NestJS 10 version of this template

The template follows the [NestJS 12 migration guide](https://docs.nestjs.com/migration-guide). If you started from an older copy, these are the changes that affect your own code:

- **CommonJS stays CommonJS.** The `@nestjs/*` packages are ESM-only now and are loaded through Node's `require(esm)`, which is why the Node versions above are required. `tsconfig.json` uses `"module": "nodenext"` and TypeScript 6. TypeScript 7 is not supported yet by the Nest CLI and `typescript-eslint`.
- **class-validator, class-transformer and Joi are gone.** DTOs are Zod schemas validated by `StandardSchemaValidationPipe`, and the env schema in `ConfigModule.forRoot({ validationSchema })` is Zod as well.
- **Express 5.** Wildcard routes must be named (`forRoutes('{*splat}')` instead of `forRoutes('*')`), and `req.query` is a read-only getter, so middleware must not assign to it. Pagination values live on `req.pagination`.
- **Mongoose 9.** Use `{ returnDocument: 'after' }` instead of `{ new: true }` in `findByIdAndUpdate` / `findOneAndUpdate`.
- **Passport.** Nest 12 only reads `@Optional()` from a class's own constructor, so guards that extend `AuthGuard()` re-declare `constructor(@Optional() options?: AuthModuleOptions)` (see `src/common/guards`). Without it, every module that uses the guard would have to import `PassportModule`. Strategies return the user from `validate()` instead of calling `done()`.
- **Jest.** The test scripts run Jest with `node --experimental-vm-modules` so it can load the ESM Nest packages. Call `npm run test` rather than `npx jest`.
- **Husky 9.** Hooks are plain shell files in `.husky/`, and `prepare` runs `husky`.

Author [Lhon Rafaat](https://github.com/LhonRafaat).
