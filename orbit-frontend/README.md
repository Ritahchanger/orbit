# orbit-frontend

The React app for Orbit. One Vite build serves three things:

| Area | URL | What it is |
|---|---|---|
| Admin dashboard | `/admin/*` | Where a business manages its stores, inventory, POS, sales, staff, reports and online orders |
| Marketing site | `/` | Orbit's public pages |
| Business storefronts | `/store/:slug` or `<slug>.<domain>` | A business's own online shop (guest checkout) |

The Electron app in [`../orbit-admin`](../orbit-admin) is a desktop window around the admin dashboard; it has no screens of its own.

For the platform as a whole (backend, terms, roles, API, deployment) see the [root README](../README.md).

## Getting started

Requirements: Node.js 20.19 or newer (required by Vite 7) and the backend running locally (see [`../orbit-backend`](../orbit-backend)).

```bash
cd orbit-frontend
npm install
# create .env first, see below
npm run dev   # http://localhost:5173
```

Sign in at `http://localhost:5173/admin/login`.

### Environment variables

Create `orbit-frontend/.env` (it is git-ignored):

```env
# Backend API, including the version prefix. Must end with a slash:
# the Google sign-in URL is built as `${VITE_API_BASE_URL}auth/google`.
VITE_API_BASE_URL=http://localhost:5000/api/v1/

# WebSocket for live M-Pesa payment updates in the POS
VITE_WS_URL=ws://localhost:5000

# Optional: WhatsApp number used by the "order on WhatsApp" buttons
VITE_WHATSAPP_NUMBER=+2547XXXXXXXX
```

`VITE_API_FRONTEND_URL` is read in `src/api/axios-conf.jsx` but not currently used anywhere, so it can be left out.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the whole project |

### Trying a storefront locally

Give a business `ecommerce.enabled`, `ecommerce.isPublished` and an `ecommerce.storeSlug`, then open `http://<storeSlug>.localhost:5173/products`. Any `*.localhost` subdomain resolves to your machine. The slug is resolved in `src/everyone-pages/storefront/hooks/useStoreSlug.js` (path, then `?store=`, then subdomain).

## Tech stack

- **React 19** with **Vite 7** (SWC plugin) and **React Router 7**
- **TanStack Query** for server data, **Redux Toolkit** for UI state such as modals
- **Tailwind CSS v4**, configured in `src/index.css` (no `tailwind.config.js`)
- **Axios** client in `src/api/axios-conf.jsx`, sending cookies with every request
- Chart.js and D3 for charts, Tiptap for rich text, `vite-plugin-pwa` for the installable app

## Project structure

```
src/
├── main.jsx, AppWrapper.jsx   Entry point and providers (Query, store, auth, roles, theme)
├── App.jsx                    Renders the routes from config/routes.config.jsx
├── config/
│   ├── routes.config.jsx      Every route, with the roles allowed to open it
│   └── features.js            On/off switches for whole features (see below)
├── context/
│   ├── authentication/        Login, current user, roles
│   ├── store/StoreContext.jsx Selected store and the "All stores" view
│   ├── permissions/           Permission checks
│   └── theme-context/         Light/dark mode
├── admin-pages/               Admin dashboard, one folder per area
│   ├── hooks/                 TanStack Query hooks per API area
│   └── services/              API calls per area
├── admin-ecommerce/           Admin screens for online orders, customers, invoices
├── everyone-pages/            Marketing site and storefront pages
├── authentication/            Login, signup and password reset screens
├── layout/                    Public site navbar and footer
├── components/                Shared components (auth guards, FeatureGate, Tiptap editor)
├── globals/                   Shared hooks, modals and loaders
└── store/                     Redux store and slices
```

`src/routes/MainRouter.jsx` is not used; routing goes through `config/routes.config.jsx`.

## How things work

### Routes and roles

All routes live in `src/config/routes.config.jsx`. Each admin route lists the roles that may open it (`cashier`, `manager`, `admin`, `superadmin`), and `App.jsx` wraps those routes in `ProtectedRoute`. Pages that appear in the admin menu take their roles from `src/config/routeRoles.js`, which both the route and the menu read, so the menu only offers pages the user can open. To add a menu page, add its roles to `ROUTE_ROLES`, its route (using `ROUTE_ROLES[path]`), and an entry in `navItems` in `src/admin-pages/dashboard/layout/data.jsx`.

### Choosing a store

The strip under the admin navbar is the only place to change which store you are looking at. It is backed by `StoreContext`:

- Admins and superadmins can pick **All stores**. Dashboard, reports, analytics and transactions then show every store combined.
- POS and inventory always work on one store: the last one picked. While "All stores" is selected they show a note saying which store that is.

In a page, read the selection with `useStoreScope()`. It returns the selected `store` and `storeId`, or `null` for both when "All stores" is selected. Don't add a separate store dropdown to a page.

### Turning features off

`src/config/features.js` holds a flag per feature. Routes and menu items tagged with a disabled `feature` are left out, and `<FeatureGate feature="...">` hides parts of a page. The newsletter and consultations features are currently off because they don't yet work per business; set their flags to `true` to bring them back.

### Styling

Design tokens (fonts, colours, text sizes, border radius) are defined in the `@theme` block of `src/index.css`. The text scale is smaller than Tailwind's default (`text-sm` is 0.7rem). Corners use the shared radius scale: controls and cards `rounded-sm` (6px), larger surfaces `rounded-lg` (8px) and up. Dark mode uses the `dark` class on `<html>`.

## Deployment

```bash
npm run build
```

Serve `dist/` from any static host, with every unknown path falling back to `index.html` so client-side routes work. `nginx.conf` in this folder is an example of that setup. The backend must allow the frontend's origin and send cookies cross-site for login to work.

## Known issues

- The PWA manifest in `vite.config.ts` and the paths in `nginx.conf` still use the old "MegaGamers" name.
- Lint reports existing errors across the codebase, mostly unused variables.
