FROM node:20.14.0-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps 

COPY . .

RUN npm run build

# stage 2

FROM node:20.14.0-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist

COPY package*.json ./

RUN npm install --only=production --legacy-peer-deps

RUN rm package*.json

EXPOSE 5000

CMD [ "node", "dist/main.js" ]