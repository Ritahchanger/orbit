# orbit-backend

Express + MongoDB REST API for Orbit. For the platform overview, setup and deployment see the [root README](../README.md).

## Running

```bash
npm install
npm run dev          # API on http://localhost:5000
npm run dev:worker   # email queue worker (Redis)
```

Configuration lives in `.env`; `.env.example` lists every setting.

## Layout

```
src/
├── server.js        App setup and middleware; mounts every route listed in routes.js
├── routes.js        The API: one ordered list of [path, router]
├── config/          DB, Redis, passport, brand (names used in emails)
├── middlewares/     Auth, roles/permissions, logging, error handler
├── errors/          CustomError and its helpers (badRequest, notFound, ...)
├── utils/           Shared helpers (log, email transport, tokens, uploads)
├── validators/      Joi schemas shared across modules
├── seeders/         Command-line seed scripts (npm run seed:*)
└── <module>/        One folder per feature: user, sales, stores, reports, ...
```

### Modules

A module owns one feature. Files are named `<name>.<role>.js`, where role is one of `routes`, `controller`, `service`, `model`, `validator`, `middleware`, `repository` or `email`:

- **Small modules are flat**, e.g. `business/business.routes.js`, `business.controller.js`, `business.service.js`, `business.model.js`.
- **Large modules split by layer**, with every file inside a layer folder, e.g. `products/routes/`, `controllers/`, `services/`, `models/`, `validators/`, `repositories/`.

Responsibilities:

- **routes** declare paths and middleware only.
- **controllers** read the request, call a service and send the response.
- **services** hold the business logic and talk to models or repositories.
- **models** define Mongoose schemas.

A module that other modules depend on exposes an `index.js` as its public API (see `products/index.js`, `permissions/index.js`); require that instead of reaching into its folders.

### Adding an endpoint

1. Add the route, controller and service in the module (create the module folder if it's new).
2. If it's a new router, add it to `src/routes.js`.
3. Scope every query to the caller's business (`req.businessId`).

### Logging

Use `src/utils/log.js`: `log.debug` for development detail (silent in production unless `LOG_LEVEL=debug`), `log.info` for startup and connection messages, `log.warn` / `log.error` for problems. Never log passwords, tokens or one-time codes.

## Known gaps

- `store-inventory/controllers/` and `store-inventory/services/` are an unfinished split of `store-inventory.controller.js`; nothing loads them yet.
- Some controllers still query models directly and some services are very large (`reports`, `products`, `sales`); moving that logic into services is planned.
- Error handling and response shapes aren't uniform yet, and most routes authenticate with the refresh-token cookie (`refreshTokenValidator`).
