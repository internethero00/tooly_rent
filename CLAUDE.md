# CLAUDE.md

Гайд для работы с этим репозиторием. Описывает архитектуру, конвенции и команды проекта **ToolyRent**.

## О проекте

ToolyRent — платформа аренды строительных инструментов. Бэкенд построен как набор микросервисов на **NestJS** внутри **Nx-монорепозитория**. Сервисы общаются через **RabbitMQ** (библиотека `nestjs-rmq`), каждый владеет своей PostgreSQL-базой (database-per-service).

Конечная цель проекта (ещё не реализована) — выстроить полноценный **observability**-слой: сквозные трейсы, структурированные логи и метрики по всем сервисам. Сейчас заложен только фундамент: сквозной `requestId` и кастомный логгер (см. ниже).

## Сервисы и их роли

Все приложения лежат в `apps/`, общий код — в `libs/`.

| Сервис | Назначение | БД (порт хоста) | Транспорт |
|---|---|---|---|
| **api-gateway** | Единственная HTTP-точка входа (REST). Транслирует HTTP → RMQ. Держит JWT-гарды, cookie, загрузку файлов в S3. | — | HTTP `:3000` (префикс `/api`) |
| **auth-service** | Учётные записи и креды, выпуск/проверка JWT, оркестрация саги удаления аккаунта. | `tooly_rent_auth` (5433) | только RMQ |
| **user-service** | Профили пользователей (имя, телефон, аватар и т.д.). | `tooly_rent_user` (5434) | только RMQ |
| **listing-service** | Инструменты (`Tool`), категории, изображения. Кэш в Redis. | `tooly_rent_listing` (5435) | только RMQ |

**Запланированы (ещё не созданы):** сервис уведомлений, booking-сервис, сервис оплаты и др. Booking сейчас существует только как заглушка-модуль в api-gateway (ветка `booking_featcher` — текущая работа в процессе, код в `apps/api-gateway/src/app/booking/` неполный/не компилируется).

Только api-gateway слушает HTTP. Остальные сервисы запускаются через `app.init()` без `app.listen()` — они работают исключительно как RMQ-консьюмеры.

## Библиотеки (`libs/`)

- **`@tooly-rent/contracts`** (`libs/contracts`) — единый источник правды для межсервисного общения. Каждый контракт это TS-`namespace` с:
  - `export const topic = '...'` — имя RMQ-топика;
  - `class Request` / `class Response` — с декораторами `class-validator`.
  - События (event-driven) описаны как строковые константы + классы `Event` (см. `account/events.ts`).
  - Менять формат запроса/ответа между сервисами нужно **только** здесь, и обе стороны (gateway и сервис) импортируют один и тот же namespace.
- **`@tooly-rent/common`** (`libs/common`) — общий рантайм-код:
  - `LoggerService` — логгер формата `[timestamp][requestId][context] message`;
  - `RequestIdInterceptor` — берёт `x-request-id` из заголовка или генерирует UUID, кладёт в `req.requestId` и в ответный заголовок.

## Межсервисное взаимодействие (RabbitMQ)

Паттерн вызова из gateway (RPC, ждём ответ):

```ts
this.rmqService.send<Req, Res>(SomeContract.topic, dto, {
  headers: { requestId, timestamp, service: 'api-gateway' },
});
```

На стороне сервиса-обработчика:

```ts
@RMQRoute(SomeContract.topic)
@RMQValidate()                       // валидация Request через class-validator
async handler(dto: SomeContract.Request, @RMQMessage msg: Message) {
  const requestId = msg.properties.headers?.requestId || 'unknown';
  // ...
}
```

- **`send`** — RPC «запрос-ответ». **`notify`** — fire-and-forget событие (используется в сагах).
- `requestId` **всегда** прокидывается через RMQ-заголовки и логируется на каждом шаге — это основа будущей трассировки. Не теряй его при добавлении новых хендлеров.
- RMQ-конфиг у каждого сервиса в `src/config/rmq.config.ts` (у gateway — `src/app/configs/`). Берёт `AMQP_*` из env. У консьюмеров задаётся `queueName` (`AMQP_QUEUE`), у gateway — нет.

### Сага удаления аккаунта (пример хореографии)

Распределённая транзакция через события (choreography saga):
1. Gateway → `AccountDeleteUser` → **auth-service** `DeletionSaga.startDeletion`: помечает юзера `PENDING_DELETION`, генерирует `sagaId`, шлёт событие `ACCOUNT_DELETION_STARTED`.
2. **user-service** ловит событие, удаляет профиль, отвечает `USER_PROFILE_DELETED` либо `USER_PROFILE_DELETION_FAILED`.
3. **auth-service** на успех — окончательно удаляет юзера; на ошибку — откатывает статус в `ACTIVE`.
4. `deletion-timeout.service.ts` (через `@nestjs/schedule`) добивает зависшие саги (`findStaleDeletions`).

`sagaId` проверяется на каждом шаге, чтобы отбрасывать устаревшие события.

## Архитектура кода внутри сервисов

**Downstream-сервисы (auth, user, listing)** используют слоистую/гексагональную структуру:

```
src/
  domain/          # entities + интерфейсы репозиториев (порты)
  infrastructure/  # prisma.service, реализации репозиториев (адаптеры)
  presentation/    # RMQ-контроллеры (@RMQRoute) + их модули/сервисы
  app/ или app.module.ts  # сборка модулей
  config/          # rmq.config.ts и пр.
```

- Репозитории инжектятся через DI-токены-символы (напр. `USER_REPOSITORY = Symbol('USER_REPOSITORY')`), провязка в модуле через `{ provide: TOKEN, useClass: ... }`. Доменный слой зависит от интерфейса, не от Prisma.

**api-gateway** организован по feature-модулям (`auth/`, `user/`, `booking/`, `tool/`, `category/`). Каждый: HTTP-`controller` + `service`, где сервис — тонкая обёртка над `RMQService.send`.

### Auth и авторизация (только в gateway)

- `AuthGuard` — проверяет `Bearer`-токен через `JwtService` (секрет `JWT_ACCESS_SECRET`), кладёт payload в `req.user`.
- `RolesGuard` + `@Roles()` — RBAC (`UserRole.USER` / `ADMIN`).
- `SelfOrAdminGuard` — доступ к ресурсу только владельцу или админу.
- Композитные декораторы в `decorators/auth.decorator.ts`: `@Authorization(...roles)` и `@AuthorizeSelfOrAdmin()`.
- Refresh-токен живёт в httpOnly-cookie (`CookieManager`); access-токен возвращается в теле ответа.

## База данных

- Каждый сервис — своя Postgres-инстанс (`docker-compose.yml`) и свой `prisma/schema.prisma`.
- Prisma 7, клиент генерируется в `src/generated/prisma` (output задан в схеме).
- Миграции в `apps/<service>/prisma/migrations/`.

## Конфигурация / окружение

- Env-файлы лежат в `envs/` (в `.gitignore`, в репо их нет — создавай локально). Каждый сервис читает свой: `.api-gateway.env`, `.auth-service.env`, `.user-service.env`, `.listing-service.env`.
- Загрузка через `dotenv` в `main.ts` (downstream) либо `ConfigModule.forRoot({ envFilePath })`.
- Ключевые переменные:
  - Все: `AMQP_EXCHANGE`, `AMQP_LOGIN`, `AMQP_PASSWORD`, `AMQP_HOSTNAME`; консьюмеры — ещё `AMQP_QUEUE`.
  - Сервисы с БД: `DATABASE_URL`.
  - auth: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`.
  - gateway: `JWT_ACCESS_SECRET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `PORT` (по умолч. 3000).
  - listing: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.

## Команды

Инфраструктура (RabbitMQ, 3× Postgres, Redis):
```sh
docker compose up -d
```

Запуск сервиса в dev-режиме (watch):
```sh
npx nx serve api-gateway        # либо auth-service / user-service / listing-service
npm run debug:api-gateway       # serve с inspector на :9229
```

Сборка / линт / тесты (через Nx, по одному проекту или для всех):
```sh
npx nx build <project>
npx nx lint <project>
npx nx test <project>           # Jest; сейчас passWithNoTests
npx nx run-many -t lint test build   # как в CI
```

Prisma (из каталога сервиса, напр. `apps/auth-service`):
```sh
npx prisma migrate dev
npx prisma generate
```

Граф зависимостей: `npx nx graph`.

## Стек и конвенции

- **NestJS 11**, **TypeScript ~5.9**, сборка через **Nx 22 + webpack**, тесты **Jest**.
- Транспорт — `nestjs-rmq` (не встроенный `@nestjs/microservices`-RMQ).
- Логируй через `LoggerService` из `@tooly-rent/common` с `requestId`, не через голый `console`. Паттерн сообщений: `[requestId][<Service>] <action>`.
- Новые межсервисные операции начинай с контракта в `libs/contracts`, затем хендлер `@RMQRoute` в сервисе и обёртка в gateway.
- DTO валидируются через `class-validator`; в gateway включён глобальный `ValidationPipe`, в RMQ-хендлерах — `@RMQValidate()`.
- Linux/CI: ветка по умолчанию для CI — `master` (`.github/workflows/ci.yml`), хотя локально основная ветка — `main`. Учитывай это при работе с PR.
