# Nestjs Mongoose Boilerplate

> A simple nestjs boilerplate that includes the basic and curcial features to help start your project quickly.

## Features

- Mongoose
- Config Service
- Swagger
- Generate client routes from swagger endpoints
- Authentication
- Google oauth
- Access Control (CASL)
- Pagination Middleware
- Refresh and Access tokens
- Unit testing and E2E testing
- Seeder
- Github actions
- Docker
- K8S

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

##### This only works if the field is not a reference, Im trying to figure out a way to apply it on referencce fields aswell.

#### Available operators and their equvilent in mongoose

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

### Usage

To start the development server, run the following command:

```shell
npm run dev
```

To start unit testing, run the following command:

```shell
npm run test
```

and to run E2E tests:

```shell
npm run test:e2e
```

to run the seeder ts-node the seed.ts file and you can pass how many data to generate as a arguement:

```shell
ts-node seed.ts 50
```

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

The server should now be running at `http://localhost:<port>`. You can access the endpoints using a tool like Postman or any web browser.

Author [Lhon Rafaat](https://github.com/LhonRafaat).
