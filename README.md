# Cat Handy

Storefront and admin UI for Cat Handy, built from the Cat Handy design canvas with Vite and React, running on Cloudflare Workers.

- `src/`: React app, served as static assets. Storefront at `/`, admin at `/admin`.
- `worker/index.js`: Hono API under `/api/*`.
- `db/schema.js`: Drizzle schema for the D1 database. `migrations/` holds the generated SQL, `db/seed.sql` the sample catalog.
- `wrangler.jsonc`: Worker, static assets and D1 binding.

## Local development

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

`npm run dev` runs the React app and the Worker together on http://localhost:5173, with a local D1 database stored in `.wrangler/`.

## API

| Route | |
|---|---|
| `GET /api/health` | Liveness check |
| `GET /api/products` | Catalog |
| `GET /api/products/:slug` | One product |
| `POST /api/orders` | Place an order from the cart. Ready-made items are priced from the catalog. |
| `GET /api/orders/:code` | Public order tracking: status and items, no customer details |

Checkout already posts to `/api/orders`. The cart itself still lives in `localStorage` (`src/lib/cart.js`), and catalog, account, tracking and admin screens still use sample data until they are switched to the API. Admin routes need auth before they get an API.

## Changing the schema

Edit `db/schema.js`, then:

```bash
npm run db:generate
npm run db:migrate:local
```

## Deploying

Once per Cloudflare account:

```bash
npx wrangler login
npx wrangler d1 create cat-handy
```

Paste the printed `database_id` into `wrangler.jsonc`, then:

```bash
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
```
