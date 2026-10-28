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
├── seeders/         Command-line seed scripts (npm run seed:*)
└── <module>/        One folder per feature: user, sales, stores, reports, ...
```

### Modules

A module owns one feature. Every module splits by layer, with each file inside the folder for its role and named `<name>.<role>.js`:

```
business/
├── routes/business.routes.js
├── controllers/business.controller.js
├── services/business.service.js
└── models/business.model.js
```

A module only has the folders it needs. The layer folders are `routes/`, `controllers/`, `services/`, `models/`, `validators/`, `repositories/`, `middlewares/`, `emails/` (email templates), `pdf/` (PDF rendering) and `constants/`. The only file at a module root is an optional `index.js`.

Responsibilities:

- **routes** declare paths and middleware only.
- **controllers** read the request, call a service and send the response.
- **services** hold the business logic and talk to models or repositories.
- **models** define Mongoose schemas.
- **repositories** are the only code that queries a model on behalf of other modules.

A module that other modules depend on exposes an `index.js` as its public API: `products`, `permissions`, `store-inventory`, `stores`, `user`, `sales`, `business` and `subscription`. Require that instead of reaching into its folders; never require another module's model. Most finders in these APIs return Mongoose queries, so callers can chain `.select()`, `.populate()`, `.session()` or `.lean()`. Stock changes go through named operations (`decrementStockIfAvailable` in products, `sellFromInventory` and `recordInventorySale` in store-inventory) so each rule lives in one place.

### Adding an endpoint

1. Add the route, controller and service in the module (create the module folder if it's new).
2. If it's a new router, add it to `src/routes.js`.
3. Scope every query to the caller's business (`req.businessId`).

### Logging

Use `src/utils/log.js`: `log.debug` for development detail (silent in production unless `LOG_LEVEL=debug`), `log.info` for startup and connection messages, `log.warn` / `log.error` for problems. Never log passwords, tokens or one-time codes.

## Platform dashboard

The `platform` module (`/api/v1/platform`) is Orbit's own staff dashboard: every business on the platform, its subscription and activity, and verifying, suspending or cancelling a business. The frontend lives in `orbit-frontend/src/platform/` and is served at `/platform`.

Platform admins (role `platform_admin`) are kept apart from businesses:

- They belong to no business and can only be created by the seeder, never through the API. Set `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` (12+ characters) in `.env`, then run `npm run seed:platform-admin`. Running it again resets the password to the one in `.env`.

- They sign in at `POST /api/v1/platform/auth/login` and get their own 8-hour `platformToken` cookie, scoped to `/api/v1/platform`. Five failed attempts per email and IP lock that login for 15 minutes.
- `tokenValidator` and `refreshTokenValidator` reject them, so business routes never run without a business, and platform routes reject business users.
- The platform module reads other modules only through their `index.js`.
- Search (`GET /api/v1/platform/search`, and the business list's `search`) covers business name, email, registration number and city, store names and codes, and business owners' names. Owners are matched by name only and returned as name + business, with no contact details; staff and customers aren't searchable.

Suspending or cancelling a business locks its users out: login refuses them and `tokenValidator` / `refreshTokenValidator` answer `403` with `code: "BUSINESS_BLOCKED"`. The check (`business-access.service.js`) is cached for 30 seconds per process, so other processes pick up a change within that time. The storefront only serves active businesses, so theirs goes offline too. Pending businesses aren't blocked.

## Feature switches

`src/config/features.js` switches whole features off. The consultations feature (bookings, consultation types, availability, consultation emails) is off unless `FEATURE_CONSULTATIONS=true`; its routes aren't mounted. Routes opt in by naming the feature as the third entry in `src/routes.js`.

## Known gaps

- `store-inventory/controllers/` and `store-inventory/services/` are an unfinished split of `store-inventory.controller.js`; nothing loads them yet.
- Some controllers still query models directly and some services are very large (`reports`, `products`, `sales`); moving that logic into services is planned.
- Error handling and response shapes aren't uniform yet, and most routes authenticate with the refresh-token cookie (`refreshTokenValidator`).
