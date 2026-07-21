# ToolyRent

**ToolyRent** — платформа аренды строительных инструментов. Бэкенд построен как набор
микросервисов на **NestJS** внутри **Nx-монорепозитория**. Сервисы общаются через
**RabbitMQ** (`nestjs-rmq`), каждый владеет собственной PostgreSQL-базой
(database-per-service).

## Архитектура

Единственная HTTP-точка входа — **api-gateway**. Он транслирует REST → RMQ, держит
JWT-гарды, cookie и загрузку файлов в S3. Остальные сервисы запускаются без
`app.listen()` и работают исключительно как RMQ-консьюмеры.

```
        HTTP (REST, :3000/api)
              │
        ┌─────▼──────┐
        │ api-gateway│
        └─────┬──────┘
              │  RabbitMQ (RPC + события)
   ┌──────────┼───────────────┐
   ▼          ▼               ▼
auth-service  user-service  listing-service
(Postgres)    (Postgres)    (Postgres + Redis)
```

### Сервисы (`apps/`)

| Сервис | Назначение | БД (порт хоста) | Транспорт |
|---|---|---|---|
| **api-gateway** | Единственная HTTP-точка входа. HTTP → RMQ, JWT-гарды, cookie, загрузка в S3. | — | HTTP `:3000` (`/api`) |
| **auth-service** | Учётки и креды, выпуск/проверка JWT, сага удаления аккаунта. | `tooly_rent_auth` (5433) | только RMQ |
| **user-service** | Профили пользователей (имя, телефон, аватар). | `tooly_rent_user` (5434) | только RMQ |
| **listing-service** | Инструменты, категории, изображения. Кэш в Redis. | `tooly_rent_listing` (5435) | только RMQ |

**Запланировано:** booking-сервис, сервис уведомлений, сервис оплаты. Booking сейчас
существует только как заглушка-модуль в api-gateway (ветка `booking_featcher`).

### Библиотеки (`libs/`)

- **`@tooly-rent/contracts`** — единый источник правды для межсервисного общения.
  Каждый контракт это TS-`namespace` с `topic`, `Request`/`Response` (декораторы
  `class-validator`) и событиями. Формат запроса/ответа меняется **только** здесь.
- **`@tooly-rent/common`** — общий рантайм: `LoggerService`
  (`[timestamp][requestId][context] message`) и `RequestIdInterceptor`
  (сквозной `x-request-id`).

### Межсервисное взаимодействие

RPC-вызов из gateway (ждём ответ):

```ts
this.rmqService.send<Req, Res>(SomeContract.topic, dto, {
  headers: { requestId, timestamp, service: 'api-gateway' },
});
```

Хендлер на стороне сервиса:

```ts
@RMQRoute(SomeContract.topic)
@RMQValidate()
async handler(dto: SomeContract.Request, @RMQMessage msg: Message) {
  const requestId = msg.properties.headers?.requestId || 'unknown';
  // ...
}
```

`send` — RPC «запрос-ответ», `notify` — fire-and-forget событие (используется в сагах,
напр. хореография удаления аккаунта). `requestId` всегда прокидывается через
RMQ-заголовки и логируется на каждом шаге.

### Observability

Заложен полноценный observability-слой: сквозные трейсы, структурированные логи и
метрики. OpenTelemetry-инструментация в сервисах пушит в **OTel Collector**, откуда
данные расходятся в **Tempo** (трейсы), **Loki** (логи) и **Prometheus** (метрики), а
визуализируются в **Grafana**.

## Требования

- **Node.js** 20+
- **Docker** + Docker Compose (RabbitMQ, 3× Postgres, Redis, стек observability)

## Быстрый старт

```sh
# 1. Зависимости
npm install

# 2. Инфраструктура (RabbitMQ, Postgres ×3, Redis, OTel/Tempo/Loki/Prometheus/Grafana)
docker compose up -d

# 3. Env-файлы — создать локально в envs/ (в .gitignore, см. ниже)
#    .api-gateway.env, .auth-service.env, .user-service.env, .listing-service.env

# 4. Prisma-клиенты и миграции (для каждого сервиса с БД)
cd apps/auth-service && npx prisma migrate dev && npx prisma generate
# аналогично для user-service и listing-service

# 5. Запуск сервисов (каждый в своём терминале)
npx nx serve api-gateway
npx nx serve auth-service
npx nx serve user-service
npx nx serve listing-service
```

API доступен на `http://localhost:3000/api`.

## Конфигурация

Env-файлы лежат в `envs/` (в `.gitignore`, в репозитории их нет — создавай локально).
Каждый сервис читает свой файл.

Ключевые переменные:

- **Все:** `AMQP_EXCHANGE`, `AMQP_LOGIN`, `AMQP_PASSWORD`, `AMQP_HOSTNAME`;
  консьюмеры — ещё `AMQP_QUEUE`.
- **Сервисы с БД:** `DATABASE_URL`.
- **auth:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION`,
  `JWT_REFRESH_EXPIRATION`.
- **gateway:** `JWT_ACCESS_SECRET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `PORT` (по умолч. 3000).
- **listing:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.

## Команды

```sh
# Dev-режим (watch)
npx nx serve <project>              # api-gateway | auth-service | user-service | listing-service
npm run debug:api-gateway           # serve с inspector на :9229

# Сборка / линт / тесты
npx nx build <project>
npx nx lint <project>
npx nx test <project>               # Jest
npx nx run-many -t lint test build  # как в CI

# Prisma (из каталога сервиса)
npx prisma migrate dev
npx prisma generate

# Граф зависимостей
npx nx graph
```

## Порты и дашборды (локально)

| Сервис | URL / порт |
|---|---|
| API Gateway | http://localhost:3000/api |
| RabbitMQ Management | http://localhost:15672 (guest / guest) |
| Grafana | http://localhost:3001 (анонимный admin) |
| Prometheus | http://localhost:9090 |
| Tempo (query API) | http://localhost:3200 |
| Loki | http://localhost:3100 |
| Postgres (auth / user / listing) | 5433 / 5434 / 5435 |
| Redis | 6379 |

## Структура сервисов

Downstream-сервисы (auth, user, listing) организованы по слоистой/гексагональной схеме:

```
src/
  domain/          # entities + интерфейсы репозиториев (порты)
  infrastructure/  # prisma.service, реализации репозиториев (адаптеры)
  presentation/    # RMQ-контроллеры (@RMQRoute) + модули/сервисы
  config/          # rmq.config.ts и пр.
```

api-gateway организован по feature-модулям (`auth/`, `user/`, `tool/`, `category/`,
`booking/`); каждый — тонкая HTTP-обёртка над `RMQService.send`.

## Стек

- **NestJS 11**, **TypeScript ~5.9**
- **Nx 22** + webpack, тесты — **Jest**
- Транспорт — **RabbitMQ** (`nestjs-rmq`)
- **Prisma 7** + PostgreSQL 16 (database-per-service)
- **Redis** (кэш listing-service)
- **OpenTelemetry** + Tempo / Loki / Prometheus / Grafana
- **AWS S3** (загрузка изображений)

