FROM node:16-alpine AS base

FROM base as builder

COPY ["./package.json", "./yarn.lock", "./"]

RUN yarn --production --silent

FROM base
WORKDIR /build

COPY --from=builder /node_modules/ /build/node_modules/
COPY --from=builder /package.json ./package.json
COPY ./src .

CMD yarn run build

FROM base
WORKDIR /app

COPY --from=builder /node_modules/ /app/node_modules/
COPY --from=builder /package.json ./package.json
COPY --from=builder /dist .

CMD node dist
EXPOSE 5000
