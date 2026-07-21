# ToolyRent

**ToolyRent** is a platform for renting construction tools. The backend is built as a set
of **NestJS** microservices inside an **Nx monorepo**. Services communicate over
**RabbitMQ** (`nestjs-rmq`), and each owns its own PostgreSQL database
(database-per-service).

## Architecture

The single HTTP entry point is **api-gateway**. It translates REST → RMQ and handles
JWT guards, cookies, and file uploads to S3. All other services start without
`app.listen()` and run purely as RMQ consumers.

```
        HTTP (REST, :3000/api)
              │
        ┌─────▼──────┐
        │ api-gateway│
        └─────┬──────┘
              │  RabbitMQ (RPC + events)
   ┌──────────┼───────────────┐
   ▼          ▼               ▼
auth-service  user-service  listing-service
(Postgres)    (Postgres)    (Postgres + Redis)
```

### Services (`apps/`)

| Service | Purpose | DB (host port) | Transport |
|---|---|---|---|
| **api-gateway** | Single HTTP entry point. HTTP → RMQ, JWT guards, cookies, S3 uploads. | — | HTTP `:3000` (`/api`) |
| **auth-service** | Accounts and credentials, JWT issuing/verification, account-deletion saga. | `tooly_rent_auth` (5433) | RMQ only |
| **user-service** | User profiles (name, phone, avatar). | `tooly_rent_user` (5434) | RMQ only |
| **listing-service** | Tools, categories, images. Redis cache. | `tooly_rent_listing` (5435) | RMQ only |

**Planned:** booking service, notification service, payment service. Booking currently
exists only as a stub module in api-gateway (branch `booking_featcher`).

### Libraries (`libs/`)

- **`@tooly-rent/contracts`** — the single source of truth for inter-service
  communication. Each contract is a TS `namespace` with `topic`, `Request`/`Response`
  (`class-validator` decorators), and events. Request/response formats change **only**
  here.
- **`@tooly-rent/common`** — shared runtime: `LoggerService`
  (`[timestamp][requestId][context] message`) and `RequestIdInterceptor`
  (end-to-end `x-request-id`).

### Inter-service communication

RPC call from the gateway (awaiting a response):

```ts
this.rmqService.send<Req, Res>(SomeContract.topic, dto, {
  headers: { requestId, timestamp, service: 'api-gateway' },
});
```

Handler on the service side:

```ts
@RMQRoute(SomeContract.topic)
@RMQValidate()
async handler(dto: SomeContract.Request, @RMQMessage msg: Message) {
  const requestId = msg.properties.headers?.requestId || 'unknown';
  // ...
}
```

`send` is a request/response RPC, `notify` is a fire-and-forget event (used in sagas,
e.g. the account-deletion choreography). The `requestId` is always propagated through
RMQ headers and logged at every step.

### Observability

A full observability layer is in place: end-to-end traces, structured logs, and metrics.
OpenTelemetry instrumentation in the services pushes to the **OTel Collector**, from
where the data fans out to **Tempo** (traces), **Loki** (logs), and **Prometheus**
(metrics), and is visualized in **Grafana**.

## Requirements

- **Node.js** 20+
- **Docker** + Docker Compose (RabbitMQ, 3× Postgres, Redis, observability stack)

## Quick start

```sh
# 1. Dependencies
npm install

# 2. Infrastructure (RabbitMQ, Postgres ×3, Redis, OTel/Tempo/Loki/Prometheus/Grafana)
docker compose up -d

# 3. Env files — create locally in envs/ (gitignored, see below)
#    .api-gateway.env, .auth-service.env, .user-service.env, .listing-service.env

# 4. Prisma clients and migrations (for each service with a DB)
cd apps/auth-service && npx prisma migrate dev && npx prisma generate
# same for user-service and listing-service

# 5. Start the services (each in its own terminal)
npx nx serve api-gateway
npx nx serve auth-service
npx nx serve user-service
npx nx serve listing-service
```

The API is available at `http://localhost:3000/api`.

## Configuration

Env files live in `envs/` (gitignored — not in the repo, create them locally). Each
service reads its own file.

Key variables:

- **All:** `AMQP_EXCHANGE`, `AMQP_LOGIN`, `AMQP_PASSWORD`, `AMQP_HOSTNAME`;
  consumers also need `AMQP_QUEUE`.
- **Services with a DB:** `DATABASE_URL`.
- **auth:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION`,
  `JWT_REFRESH_EXPIRATION`.
- **gateway:** `JWT_ACCESS_SECRET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `PORT` (default 3000).
- **listing:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.

## Commands

```sh
# Dev mode (watch)
npx nx serve <project>              # api-gateway | auth-service | user-service | listing-service
npm run debug:api-gateway           # serve with inspector on :9229

# Build / lint / test
npx nx build <project>
npx nx lint <project>
npx nx test <project>               # Jest
npx nx run-many -t lint test build  # as in CI

# Prisma (from the service directory)
npx prisma migrate dev
npx prisma generate

# Dependency graph
npx nx graph
```

## Ports and dashboards (local)

| Service | URL / port |
|---|---|
| API Gateway | http://localhost:3000/api |
| RabbitMQ Management | http://localhost:15672 (guest / guest) |
| Grafana | http://localhost:3001 (anonymous admin) |
| Prometheus | http://localhost:9090 |
| Tempo (query API) | http://localhost:3200 |
| Loki | http://localhost:3100 |
| Postgres (auth / user / listing) | 5433 / 5434 / 5435 |
| Redis | 6379 |

## Service structure

Downstream services (auth, user, listing) follow a layered/hexagonal structure:

```
src/
  domain/          # entities + repository interfaces (ports)
  infrastructure/  # prisma.service, repository implementations (adapters)
  presentation/    # RMQ controllers (@RMQRoute) + modules/services
  config/          # rmq.config.ts, etc.
```

api-gateway is organized by feature modules (`auth/`, `user/`, `tool/`, `category/`,
`booking/`); each is a thin HTTP wrapper over `RMQService.send`.

## Stack

- **NestJS 11**, **TypeScript ~5.9**
- **Nx 22** + webpack, tests with **Jest**
- Transport — **RabbitMQ** (`nestjs-rmq`)
- **Prisma 7** + PostgreSQL 16 (database-per-service)
- **Redis** (listing-service cache)
- **OpenTelemetry** + Tempo / Loki / Prometheus / Grafana
- **AWS S3** (image uploads)
