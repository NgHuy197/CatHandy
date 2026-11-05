import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { drizzle } from 'drizzle-orm/d1';
import { eq, inArray, sql } from 'drizzle-orm';
import { orderItems, orders, products } from '../db/schema';

// Only /api/* reaches this Worker (see run_worker_first in wrangler.jsonc); everything else is the built React app.
const app = new Hono().basePath('/api');

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Random rather than sequential, so nobody can walk the tracking endpoint through other people's orders.
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const newOrderCode = () =>
  'CH-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => CODE_CHARS[b % 32]).join('');

app.get('/health', (c) => c.json({ ok: true }));

app.get('/products', async (c) => {
  const db = drizzle(c.env.DB);
  return c.json(await db.select().from(products).orderBy(products.id));
});

app.get('/products/:slug', async (c) => {
  const db = drizzle(c.env.DB);
  const [product] = await db.select().from(products).where(eq(products.slug, c.req.param('slug')));
  return product ? c.json(product) : c.json({ error: 'Không tìm thấy sản phẩm' }, 404);
});

app.post('/orders', bodyLimit({ maxSize: 64 * 1024 }), async (c) => {
  const body = await c.req.json().catch(() => null);
  const customer = body?.customer ?? {};
  const items = Array.isArray(body?.items) ? body.items : [];
  const name = str(customer.name, 100);
  const phone = str(customer.phone, 30);
  const address = str(customer.addr);
  if (!name || !phone || !address) return c.json({ error: 'Bạn điền đủ họ tên, số điện thoại và địa chỉ nhé.' }, 400);
  if (!items.length || items.length > 20) return c.json({ error: 'Giỏ hàng đang trống.' }, 400);

  const db = drizzle(c.env.DB);

  // Ready-made items take the catalog price, not the one the browser sent.
  // Custom chibi are still priced by the customizer in the browser; move that pricing here before taking payments.
  const readyTitles = items.filter((it) => !it.isCustom).map((it) => str(it.title));
  const catalog = readyTitles.length
    ? await db
        .select({ title: products.title, price: products.price })
        .from(products)
        .where(inArray(products.title, readyTitles))
    : [];
  const catalogPrice = new Map(catalog.map((p) => [p.title, p.price]));

  const lines = [];
  for (const it of items) {
    const title = str(it.title, 200);
    const isCustom = Boolean(it.isCustom);
    const qty = Math.trunc(Number(it.qty));
    const unitPrice = isCustom ? Math.trunc(Number(it.price)) : catalogPrice.get(title);
    if (!title || !(qty >= 1 && qty <= 9) || !(unitPrice > 0)) {
      return c.json({ error: `Món "${title || '?'}" trong giỏ không hợp lệ.` }, 400);
    }
    lines.push({
      title,
      sub: str(it.sub, 200),
      isCustom,
      unitPrice,
      qty,
      design: isCustom ? { a: it.a ?? null, b: it.b ?? null, lines: it.lines ?? [], note: str(it.note) } : null,
    });
  }

  const code = newOrderCode();
  const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  // One batch is one D1 transaction: the order and its items are saved together or not at all.
  await db.batch([
    db.insert(orders).values({ code, customerName: name, phone, address, note: str(customer.note), total }),
    db.insert(orderItems).values(
      lines.map((l) => ({ ...l, orderId: sql`(SELECT id FROM orders WHERE code = ${code})` })),
    ),
  ]);

  return c.json({ code, total, items: lines.map(({ title, isCustom, qty }) => ({ title, isCustom, qty })) }, 201);
});

// Public order tracking: status and items only, never the customer's name, phone or address.
app.get('/orders/:code', async (c) => {
  const db = drizzle(c.env.DB);
  const [order] = await db
    .select({ id: orders.id, code: orders.code, status: orders.status, total: orders.total, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.code, c.req.param('code').toUpperCase()));
  if (!order) return c.json({ error: 'Không tìm thấy đơn hàng' }, 404);

  const items = await db
    .select({ title: orderItems.title, isCustom: orderItems.isCustom, qty: orderItems.qty })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const { id, ...rest } = order;
  return c.json({ ...rest, items });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Máy chủ gặp lỗi, bạn thử lại sau nhé.' }, 500);
});

export default app;
