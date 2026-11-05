import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const createdAt = () =>
  text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`);

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull().unique(),
  sub: text('sub').notNull(),
  category: text('category').notNull(),
  material: text('material').notNull(),
  price: integer('price').notNull(),
  ready: integer('ready', { mode: 'boolean' }).notNull().default(true),
  wash: text('wash').notNull(),
  // chibi() overrides for the one or two characters shown on the product card.
  chibiA: text('chibi_a', { mode: 'json' }).notNull(),
  chibiB: text('chibi_b', { mode: 'json' }),
  createdAt: createdAt(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  note: text('note').notNull().default(''),
  total: integer('total').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: createdAt(),
});

export const orderItems = sqliteTable(
  'order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    sub: text('sub').notNull().default(''),
    isCustom: integer('is_custom', { mode: 'boolean' }).notNull(),
    unitPrice: integer('unit_price').notNull(),
    qty: integer('qty').notNull(),
    // For custom chibi: the characters, option lines and note the shop builds from.
    design: text('design', { mode: 'json' }),
  },
  (t) => [index('order_items_order_id_idx').on(t.orderId)],
);
