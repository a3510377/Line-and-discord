FROM node:16-alpine AS builder

COPY ["./package.json", "./yarn.lock", "./"]

RUN yarn --production --silent

# app
FROM node:16-alpine

WORKDIR /app
COPY --from=builder /node_modules/ /app/node_modules/
COPY ./src ./src
COPY --from=builder /package.json ./package.json

CMD yarn run start

EXPOSE 5000
