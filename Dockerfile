FROM node:24-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# stage 2

FROM node:24-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist

COPY package*.json ./

# husky (the prepare script) is a dev dependency, so drop the hook before a production install
RUN npm pkg delete scripts.prepare && npm ci --omit=dev

RUN rm package*.json

EXPOSE 5000

CMD [ "node", "dist/main.js" ]
