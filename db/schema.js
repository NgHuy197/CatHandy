import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const createdAt = () =>
  text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`);

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  // Default delivery details, prefilled at checkout.
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  passwordHash: text('password_hash'),
  googleSub: text('google_sub').unique(),
  role: text('role').notNull().default('customer'),
  createdAt: createdAt(),
});

// The cookie holds a random token; only its SHA-256 is stored here.
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
);

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull().unique(),
  sub: text('sub').notNull(),
  category: text('category').notNull(),
  material: text('material').notNull(),
  price: integer('price').notNull(),
  ready: integer('ready', { mode: 'boolean' }).notNull().default(true),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
  wash: text('wash').notNull(),
  description: text('description').notNull().default(''),
  // R2 keys, served from /api/media/<key>.
  images: text('images', { mode: 'json' }).notNull().default([]),
  // { colors: [{ value, label }], sizes: [{ code, label, price }] }; a size price replaces `price`.
  variants: text('variants', { mode: 'json' }),
  // Customizer box this product is made in, for the "Tự tay tạo chibi" shortcut.
  boxCode: text('box_code'),
  // chibi() overrides for the one or two characters shown on the product card.
  chibiA: text('chibi_a', { mode: 'json' }).notNull(),
  chibiB: text('chibi_b', { mode: 'json' }),
  createdAt: createdAt(),
});

export const reviews = sqliteTable(
  'reviews',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    body: text('body').notNull().default(''),
    photos: text('photos', { mode: 'json' }).notNull().default([]),
    createdAt: createdAt(),
  },
  (t) => [index('reviews_product_id_idx').on(t.productId)],
);

export const wishlist = sqliteTable(
  'wishlist',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

// status is one of the codes in shared/orders.js, which also holds the labels.
export const orders = sqliteTable(
  'orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    customerName: text('customer_name').notNull(),
    phone: text('phone').notNull(),
    address: text('address').notNull(),
    note: text('note').notNull().default(''),
    total: integer('total').notNull(),
    status: text('status').notNull().default('new'),
    // Null until an admin opens the order; unseen orders are highlighted in the admin.
    seenAt: text('seen_at'),
    createdAt: createdAt(),
  },
  (t) => [
    index('orders_user_id_idx').on(t.userId),
    index('orders_phone_idx').on(t.phone),
    index('orders_created_at_idx').on(t.createdAt),
  ],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productSlug: text('product_slug'),
    title: text('title').notNull(),
    sub: text('sub').notNull().default(''),
    variant: text('variant').notNull().default(''),
    isCustom: integer('is_custom', { mode: 'boolean' }).notNull(),
    unitPrice: integer('unit_price').notNull(),
    qty: integer('qty').notNull(),
    // Custom chibi: { box, count, a, b, lines, note }. Ready-made: { a, b } for the thumbnail.
    design: text('design', { mode: 'json' }),
  },
  (t) => [index('order_items_order_id_idx').on(t.orderId)],
);

// kind 'internal' is the shop's own note; 'revision' is a change the customer asked for after seeing photos.
export const orderNotes = sqliteTable(
  'order_notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('internal'),
    body: text('body').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('order_notes_order_id_idx').on(t.orderId)],
);

// Photos of the finished piece, shown to the customer for approval on the tracking page.
export const orderPhotos = sqliteTable(
  'order_photos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('order_photos_order_id_idx').on(t.orderId)],
);

// Customizer choices, grouped as in the admin: box, skin, hair, hairColor, face, gl, outfit, outfitColor, acc.
export const options = sqliteTable(
  'options',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    grp: text('grp').notNull(),
    code: text('code').notNull(),
    label: text('label').notNull(),
    // Swatch colour; for colour groups the code is the colour itself.
    color: text('color'),
    // Base price for a box, surcharge for anything else.
    price: integer('price').notNull().default(0),
    // Box codes this option is limited to; null means every box.
    boxes: text('boxes', { mode: 'json' }),
    hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
    sort: integer('sort').notNull().default(0),
    // Optional uploaded layer image drawn over the built-in chibi in the live preview.
    layerKey: text('layer_key'),
    description: text('description').notNull().default(''),
    wash: text('wash'),
  },
  (t) => [uniqueIndex('options_grp_code_unique').on(t.grp, t.code)],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
});

export const presets = sqliteTable('presets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  box: text('box').notNull(),
  count: integer('count').notNull().default(1),
  // chibi() overrides per character.
  chars: text('chars', { mode: 'json' }).notNull(),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
  sort: integer('sort').notNull().default(0),
  createdAt: createdAt(),
});
