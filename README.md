# Cat Handy

Storefront and admin for Cat Handy, built from the Cat Handy design canvas with Vite and React, running on Cloudflare Workers.

- `src/`: React app, served as static assets. Storefront at `/`, admin at `/admin` (admins only).
- `worker/`: Hono API under `/api/*`. `worker/index.js` mounts the routes in `worker/routes/`; shared helpers are in `worker/lib/`.
- `shared/`: code both sides import: customizer pricing (`customizer.js`), order statuses (`orders.js`), formatting.
- `db/schema.js`: Drizzle schema for D1. `migrations/` holds the generated SQL, `db/seed.sql` the starting catalog, customizer options, prices and presets.
- `wrangler.jsonc`: Worker, static assets, D1 (`DB`) and R2 (`MEDIA`) bindings.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

`npm run dev` runs the React app and the Worker together on http://localhost:5173, with local D1 and R2 stored in `.wrangler/`.

### Admin accounts

`ADMIN_EMAILS` only promotes an email the first time it signs in with Google, because Google has verified it. Signing up with a password never grants admin: nobody checks that the address belongs to the person typing it. To make a password account an admin, sign up, then run (use `--remote` for the deployed database):

```bash
npx wrangler d1 execute cat-handy --local --command "UPDATE users SET role = 'admin' WHERE email = 'you@example.com'"
```

After signing in, fill in the shop's phone, email, Zalo, Messenger, Shopee and Fanpage at `/admin/cai-dat`. Until then the footer, chat buttons and tracking page leave those out.

## What the API covers

| Area | Routes |
|---|---|
| Accounts | `POST /api/auth/register`, `/login`, `/google`, `/logout`, `GET /api/auth/me`, `PATCH /api/account`, `GET /api/account/orders`, wishlist under `/api/account/wishlist` |
| Catalog | `GET /api/products`, `GET /api/products/:slug` (with reviews), `POST /api/products/:slug/reviews` (buyers only), `GET /api/customizer` |
| Orders | `POST /api/orders`, `GET /api/orders/track?q=` (code or phone; a phone lookup masks the codes), `POST /api/orders/:code/approve` and `/revision` (body carries the order's phone) |
| Admin | `/api/admin/orders` (status, notes, finished photos), `/api/admin/customers`, `/api/admin/options`, `/api/admin/settings`, `/api/admin/presets`, `/api/admin/products`, `/api/admin/reports`, `/api/admin/uploads`, `/api/admin/shop` |
| Files | `POST /api/uploads` (review photos), `GET /api/media/<key>` (anything stored in R2, with Range support for video) |
| Settings | `GET /api/config` (Google client id and the shop's contact details) |

Placing orders, signing in, tracking and uploading are rate limited per visitor (the `ratelimits` bindings in `wrangler.jsonc`, used from `worker/lib/limits.js`).

The server re-prices every order: ready-made items from the catalog, custom chibi from the admin's customizer options through `shared/customizer.js`, the same code the customizer uses for its live price. The cart itself stays in `localStorage`.

New orders appear highlighted in the admin with a count in the sidebar, and go to Telegram when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set.

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
npx wrangler r2 bucket create cat-handy-media
```

Paste the printed `database_id` into `wrangler.jsonc`. Set the settings from `.dev.vars.example` as secrets, for example:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
```

Then:

```bash
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
```

Then make your account an admin (see Admin accounts above) and fill in `/admin/cai-dat`.
