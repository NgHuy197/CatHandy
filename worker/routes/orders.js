import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { orderItems, orderNotes, orders as ordersTable, products, users } from '../../db/schema';
import { layersFor, quoteDesign } from '../../shared/customizer';
import { normalizePhone } from '../../shared/format';
import { currentUser } from '../lib/auth';
import { loadConfig } from '../lib/customizer';
import { adminOrderUrl, newOrderMessage, notifyShop } from '../lib/notify';
import { newOrderCode, ORDER_CODE, withDetails } from '../lib/orders';
import { fail, getDb, int, readJson, str } from '../lib/util';

const orders = new Hono();

function qtyOf(it) {
  const qty = int(it.qty);
  if (!(qty >= 1 && qty <= 9)) fail(400, 'Số lượng mỗi món từ 1 đến 9.');
  return qty;
}

// A ready-made product, priced from the catalog and its chosen colour and size.
function readyLine(catalog, it) {
  const p = catalog.find((x) => x.slug === str(it.slug, 100));
  if (!p) fail(400, `"${str(it.title, 100) || 'Một sản phẩm'}" hiện không còn bán, bạn xóa khỏi giỏ giúp shop nhé.`);
  const v = it.variant || {};
  let unitPrice = p.price;
  let a = p.chibiA;
  const parts = [];
  if (p.variants?.colors?.length) {
    const color = p.variants.colors.find((x) => x.value === v.color);
    if (!color) fail(400, `Bạn chọn lại màu cho "${p.title}" nhé.`);
    parts.push('Màu ' + color.label.toLowerCase());
    a = { ...a, outfitColor: color.value };
  }
  if (p.variants?.sizes?.length) {
    const size = p.variants.sizes.find((x) => x.code === v.size);
    if (!size) fail(400, `Bạn chọn lại cỡ cho "${p.title}" nhé.`);
    parts.push('Cỡ ' + size.label.toLowerCase());
    unitPrice = size.price;
  }
  return {
    productSlug: p.slug,
    title: p.title,
    sub: p.sub,
    variant: parts.join(', '),
    isCustom: false,
    unitPrice,
    qty: qtyOf(it),
    design: { a, b: p.chibiB },
  };
}

// A custom chibi, priced from the admin's current customizer config rather than what the browser showed.
function customLine(config, it) {
  const quote = quoteDesign(config, it.design);
  if (quote.error) fail(400, quote.error);
  const [a, b] = quote.chars.map((ch) => ({ ...ch, layers: layersFor(config, quote.box.code, ch) }));
  return {
    productSlug: null,
    title: quote.box.label,
    sub: quote.count + ' nhân vật',
    variant: '',
    isCustom: true,
    unitPrice: quote.total,
    qty: qtyOf(it),
    design: {
      box: quote.box.code,
      count: quote.count,
      a,
      b: b ?? null,
      lines: quote.descriptions,
      priceLines: quote.lines,
      note: str(it.design?.note, 1000),
    },
  };
}

orders.post('/', bodyLimit({ maxSize: 128 * 1024 }), async (c) => {
  const body = await readJson(c);
  const customer = body.customer || {};
  const customerName = str(customer.name, 100);
  const phone = normalizePhone(str(customer.phone, 30));
  const address = str(customer.addr, 500);
  if (!customerName || !address) fail(400, 'Bạn điền đủ họ tên, số điện thoại và địa chỉ nhé.');
  if (phone.replace('+', '').length < 9) fail(400, 'Số điện thoại chưa đúng, bạn kiểm tra lại nhé.');
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) fail(400, 'Giỏ hàng đang trống.');
  if (items.length > 20) fail(400, 'Một đơn tối đa 20 món.');

  const db = getDb(c);
  // An admin placing an order is usually entering one for a customer, so it is filed as a guest order by phone.
  const signedIn = await currentUser(c);
  const user = signedIn?.role === 'admin' ? null : signedIn;
  const slugs = items.filter((it) => !it.isCustom).map((it) => str(it.slug, 100));
  const [config, catalog] = await Promise.all([
    items.some((it) => it.isCustom) ? loadConfig(db) : null,
    slugs.length
      ? db.select().from(products).where(and(inArray(products.slug, slugs), eq(products.hidden, false)))
      : [],
  ]);
  const lines = items.map((it) => (it.isCustom ? customLine(config, it) : readyLine(catalog, it)));

  const order = {
    code: newOrderCode(),
    userId: user?.id ?? null,
    customerName,
    phone,
    address,
    note: str(customer.note, 1000),
    total: lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
  };
  // One batch is one D1 transaction: the order and its items are saved together or not at all.
  await db.batch([
    db.insert(ordersTable).values(order),
    db
      .insert(orderItems)
      .values(lines.map((l) => ({ ...l, orderId: sql`(SELECT id FROM orders WHERE code = ${order.code})` }))),
  ]);

  // First order from an account fills its default delivery details, so the next checkout is prefilled.
  if (user && !user.phone && !user.address) {
    await db.update(users).set({ phone, address }).where(eq(users.id, user.id));
  }
  notifyShop(c, newOrderMessage(c, order, lines));

  return c.json(
    {
      code: order.code,
      total: order.total,
      items: lines.map(({ title, variant, isCustom, qty }) => ({ title, variant, isCustom, qty })),
    },
    201,
  );
});

const PUBLIC_FIELDS = {
  id: ordersTable.id,
  code: ordersTable.code,
  status: ordersTable.status,
  total: ordersTable.total,
  createdAt: ordersTable.createdAt,
};

// Public tracking by order code or phone number. Never returns the customer's name, phone or address.
orders.get('/track', async (c) => {
  const q = str(c.req.query('q'), 40).toUpperCase();
  const db = getDb(c);
  let where;
  if (ORDER_CODE.test(q)) where = eq(ordersTable.code, q);
  else if (normalizePhone(q).replace('+', '').length >= 9) where = eq(ordersTable.phone, normalizePhone(q));
  else fail(400, 'Bạn nhập số điện thoại đầy đủ hoặc mã đơn dạng CH-XXXXXX nhé.');
  const rows = await db.select(PUBLIC_FIELDS).from(ordersTable).where(where).orderBy(desc(ordersTable.id)).limit(10);
  return c.json({ orders: await withDetails(db, rows) });
});

async function awaitingOrder(c) {
  const [order] = await getDb(c)
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.code, c.req.param('code').toUpperCase()));
  if (!order) fail(404, 'Không tìm thấy đơn hàng.');
  if (order.status !== 'awaiting') fail(409, 'Đơn này hiện không chờ duyệt ảnh.');
  return order;
}

orders.post('/:code/approve', async (c) => {
  const order = await awaitingOrder(c);
  await getDb(c).update(ordersTable).set({ status: 'approved' }).where(eq(ordersTable.id, order.id));
  notifyShop(c, `Khách đã duyệt ảnh đơn ${order.code}, có thể giao vận chuyển.\n${adminOrderUrl(c, order.code)}`);
  return c.json({ status: 'approved' });
});

orders.post('/:code/revision', async (c) => {
  const order = await awaitingOrder(c);
  const text = str((await readJson(c)).body, 1000);
  if (!text) fail(400, 'Bạn mô tả điều cần chỉnh giúp shop nhé.');
  const db = getDb(c);
  await db.batch([
    db.update(ordersTable).set({ status: 'revision' }).where(eq(ordersTable.id, order.id)),
    db.insert(orderNotes).values({ orderId: order.id, kind: 'revision', body: text }),
  ]);
  notifyShop(c, `Khách yêu cầu chỉnh sửa đơn ${order.code}:\n${text}\n${adminOrderUrl(c, order.code)}`);
  return c.json({ status: 'revision' });
});

export default orders;
