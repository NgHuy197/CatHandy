import { Hono } from 'hono';
import { and, desc, eq, inArray, isNull, like, or, sql } from 'drizzle-orm';
import { options, orderNotes, orderPhotos, orders, presets, products, settings, users } from '../../db/schema';
import { CHAR_FIELDS, normalizeChar, OPTION_GROUPS } from '../../shared/customizer';
import { mediaUrl, normalizePhone } from '../../shared/format';
import { ORDER_STATUSES, STATUS_CODES } from '../../shared/orders';
import { requireAdmin } from '../lib/auth';
import { loadConfig, optionOut } from '../lib/customizer';
import { deleteUpload, saveUpload } from '../lib/media';
import { withDetails } from '../lib/orders';
import { loadShop, shopFields } from '../lib/shop';
import { fail, getDb, int, readJson, str } from '../lib/util';
import { productOut } from './catalog';

const admin = new Hono();
admin.use(requireAdmin);

const COLOR = /^#[0-9a-f]{6}$/i;
const COLOR_GROUPS = ['skin', 'hairColor', 'outfitColor'];
const CATEGORIES = ['go', 'mica', 'cuoi', 'nam', 'phukien'];
const MATERIALS = ['Gỗ', 'Mica', 'Khác'];

const money = (v, what) => {
  const n = int(v);
  if (!(n >= 0 && n <= 50000000)) fail(400, `${what} phải là số tiền hợp lệ.`);
  return n;
};
const uploadKey = (v) => (typeof v === 'string' && v.startsWith('uploads/') ? v.slice(0, 200) : null);
const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

// ---------- Orders ----------

async function findOrder(c) {
  const [order] = await getDb(c)
    .select()
    .from(orders)
    .where(eq(orders.code, c.req.param('code').toUpperCase()));
  if (!order) fail(404, 'Không tìm thấy đơn hàng.');
  return order;
}

// Newest 100 orders, optionally narrowed to a status group (new, craft, wait, done) or a search on code, phone or name.
admin.get('/orders', async (c) => {
  const db = getDb(c);
  const group = c.req.query('group');
  const q = str(c.req.query('q'), 60);
  const conds = [];
  if (group && group !== 'all') {
    const codes = ORDER_STATUSES.filter((s) => s.group === group).map((s) => s.code);
    conds.push(inArray(orders.status, codes.length ? codes : ['?']));
  }
  if (q) {
    conds.push(
      or(
        like(orders.code, `%${q.toUpperCase()}%`),
        like(orders.customerName, `%${q}%`),
        ...(normalizePhone(q) ? [like(orders.phone, `%${normalizePhone(q)}%`)] : []),
      ),
    );
  }
  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      customerName: orders.customerName,
      phone: orders.phone,
      address: orders.address,
      note: orders.note,
      total: orders.total,
      status: orders.status,
      seenAt: orders.seenAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(orders.id))
    .limit(100);
  return c.json(await withDetails(db, rows, 'owner'));
});

// Opening an order marks it seen, which clears its highlight and the sidebar count.
admin.get('/orders/:code', async (c) => {
  const db = getDb(c);
  const order = await findOrder(c);
  if (!order.seenAt) {
    order.seenAt = new Date().toISOString();
    await db.update(orders).set({ seenAt: order.seenAt }).where(eq(orders.id, order.id));
  }
  const [detail] = await withDetails(db, [order], 'admin');
  const [user] = order.userId
    ? await db.select({ email: users.email }).from(users).where(eq(users.id, order.userId))
    : [];
  return c.json({ ...detail, userEmail: user?.email ?? null });
});

admin.patch('/orders/:code', async (c) => {
  const order = await findOrder(c);
  const status = str((await readJson(c)).status, 20);
  if (!STATUS_CODES.includes(status)) fail(400, 'Trạng thái không hợp lệ.');
  if (status === 'awaiting') {
    const [photo] = await getDb(c).select({ id: orderPhotos.id }).from(orderPhotos).where(eq(orderPhotos.orderId, order.id)).limit(1);
    if (!photo) fail(400, 'Tải ảnh sản phẩm hoàn thiện lên trước khi gửi khách duyệt.');
  }
  await getDb(c).update(orders).set({ status }).where(eq(orders.id, order.id));
  return c.json({ status });
});

admin.post('/orders/:code/notes', async (c) => {
  const order = await findOrder(c);
  const body = str((await readJson(c)).body, 2000);
  if (!body) fail(400, 'Ghi chú đang trống.');
  const [note] = await getDb(c).insert(orderNotes).values({ orderId: order.id, kind: 'internal', body }).returning();
  return c.json(note, 201);
});

admin.post('/orders/:code/photos', async (c) => {
  const order = await findOrder(c);
  const form = await c.req.parseBody();
  const key = await saveUpload(c, form.file, { maxMb: 10 });
  const [photo] = await getDb(c).insert(orderPhotos).values({ orderId: order.id, key }).returning();
  return c.json({ id: photo.id, url: mediaUrl(key) }, 201);
});

admin.delete('/orders/:code/photos/:id', async (c) => {
  const order = await findOrder(c);
  const db = getDb(c);
  const [photo] = await db
    .select()
    .from(orderPhotos)
    .where(and(eq(orderPhotos.id, int(c.req.param('id'))), eq(orderPhotos.orderId, order.id)));
  if (!photo) fail(404, 'Không tìm thấy ảnh.');
  await db.delete(orderPhotos).where(eq(orderPhotos.id, photo.id));
  await deleteUpload(c, photo.key);
  return c.json({ ok: true });
});

// Small numbers the admin sidebar polls for its new-order badge.
admin.get('/summary', async (c) => {
  const [row] = await getDb(c)
    .select({ unseen: sql`count(*)`.mapWith(Number) })
    .from(orders)
    .where(isNull(orders.seenAt));
  return c.json({ unseen: row.unseen, telegram: !!(c.env.TELEGRAM_BOT_TOKEN && c.env.TELEGRAM_CHAT_ID) });
});

// ---------- Customers ----------
// Registered customers are keyed by account ("u12"); guest checkouts are grouped by phone ("p0901234567").

admin.get('/customers', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT 'u' || u.id AS key, u.name, u.email, u.phone, 1 AS registered,
            COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spent, MAX(o.created_at) AS lastOrderAt
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
     UNION ALL
     SELECT 'p' || o.phone,
            (SELECT o2.customer_name FROM orders o2 WHERE o2.phone = o.phone AND o2.user_id IS NULL ORDER BY o2.id DESC LIMIT 1),
            '', o.phone, 0, COUNT(*), SUM(o.total), MAX(o.created_at)
       FROM orders o WHERE o.user_id IS NULL
      GROUP BY o.phone
      ORDER BY lastOrderAt DESC NULLS LAST
      LIMIT 500`,
  ).all();
  return c.json(results.map((r) => ({ ...r, registered: !!r.registered })));
});

admin.get('/customers/:key', async (c) => {
  const db = getDb(c);
  const key = c.req.param('key');
  let profile;
  let where;
  if (key.startsWith('u')) {
    const [u] = await db.select().from(users).where(eq(users.id, int(key.slice(1))));
    if (!u) fail(404, 'Không tìm thấy khách hàng.');
    profile = { key, name: u.name, email: u.email, phone: u.phone, address: u.address, registered: true, since: u.createdAt };
    where = eq(orders.userId, u.id);
  } else {
    const phone = normalizePhone(key.slice(1));
    where = and(eq(orders.phone, phone), isNull(orders.userId));
    profile = { key, phone, registered: false };
  }
  const rows = await db
    .select({ id: orders.id, code: orders.code, status: orders.status, total: orders.total, createdAt: orders.createdAt, customerName: orders.customerName, address: orders.address })
    .from(orders)
    .where(where)
    .orderBy(desc(orders.id))
    .limit(100);
  if (!rows.length && !profile.registered) fail(404, 'Không tìm thấy khách hàng.');
  if (!profile.registered) Object.assign(profile, { name: rows[0].customerName, address: rows[0].address, since: rows.at(-1).createdAt });
  return c.json({ ...profile, orders: await withDetails(db, rows) });
});

// ---------- Customizer options, prices, presets ----------

admin.get('/customizer', async (c) => c.json(await loadConfig(getDb(c), { includeHidden: true })));

async function boxCodes(db) {
  return (await db.select({ code: options.code }).from(options).where(eq(options.grp, 'box'))).map((r) => r.code);
}

async function optionFields(c, body, grp) {
  const f = {};
  if (body.label !== undefined) {
    f.label = str(body.label, 60);
    if (!f.label) fail(400, 'Tên tùy chọn không được để trống.');
  }
  if (body.price !== undefined) f.price = money(body.price, 'Giá');
  if (body.hidden !== undefined) f.hidden = !!body.hidden;
  if (body.sort !== undefined) f.sort = int(body.sort) || 0;
  if (body.color !== undefined) {
    if (body.color !== null && !COLOR.test(body.color)) fail(400, 'Màu phải có dạng #rrggbb.');
    f.color = body.color && body.color.toLowerCase();
  }
  if (body.layerKey !== undefined) f.layerKey = uploadKey(body.layerKey);
  if (body.description !== undefined) f.description = str(body.description, 200);
  if (body.wash !== undefined) {
    if (body.wash !== null && !COLOR.test(body.wash)) fail(400, 'Màu nền phải có dạng #rrggbb.');
    f.wash = body.wash;
  }
  if (body.boxes !== undefined) {
    if (grp === 'box' || body.boxes === null || (Array.isArray(body.boxes) && !body.boxes.length)) f.boxes = null;
    else {
      const known = await boxCodes(getDb(c));
      if (!Array.isArray(body.boxes) || body.boxes.some((b) => !known.includes(b))) fail(400, 'Loại hộp áp dụng không hợp lệ.');
      f.boxes = body.boxes;
    }
  }
  return f;
}

admin.post('/options', async (c) => {
  const body = await readJson(c);
  const grp = str(body.grp, 20);
  if (!OPTION_GROUPS.some(([g]) => g === grp)) fail(400, 'Nhóm tùy chọn không hợp lệ.');
  // Kính and râu are fixed on/off switches in the customizer; only their price and visibility change.
  if (grp === 'gl') fail(400, 'Nhóm kính và râu chỉ sửa được giá và ẩn hiện.');
  const fields = await optionFields(c, { price: 0, ...body }, grp);
  if (!fields.label) fail(400, 'Tên tùy chọn không được để trống.');
  if (COLOR_GROUPS.includes(grp) && !fields.color) fail(400, 'Tùy chọn màu cần mã màu.');
  const code = COLOR_GROUPS.includes(grp) ? fields.color.toLowerCase() : slugify(str(body.code, 60) || fields.label);
  if (!code) fail(400, 'Không tạo được mã cho tùy chọn này.');
  const db = getDb(c);
  const [dupe] = await db.select({ id: options.id }).from(options).where(and(eq(options.grp, grp), eq(options.code, code)));
  if (dupe) fail(409, 'Nhóm này đã có tùy chọn trùng mã hoặc trùng màu.');
  const [row] = await db.insert(options).values({ ...fields, grp, code, sort: fields.sort ?? 99 }).returning();
  return c.json(optionOut(row), 201);
});

admin.patch('/options/:id', async (c) => {
  const db = getDb(c);
  const [current] = await db.select().from(options).where(eq(options.id, int(c.req.param('id'))));
  if (!current) fail(404, 'Không tìm thấy tùy chọn.');
  const fields = await optionFields(c, await readJson(c), current.grp);
  if (!Object.keys(fields).length) return c.json(optionOut(current));
  const [row] = await db.update(options).set(fields).where(eq(options.id, current.id)).returning();
  if (current.layerKey && current.layerKey !== row.layerKey) await deleteUpload(c, current.layerKey);
  return c.json(optionOut(row));
});

admin.delete('/options/:id', async (c) => {
  const db = getDb(c);
  const [current] = await db.select().from(options).where(eq(options.id, int(c.req.param('id'))));
  if (!current) fail(404, 'Không tìm thấy tùy chọn.');
  if (current.grp === 'gl') fail(400, 'Kính và râu không xóa được, bạn ẩn đi nếu không nhận làm.');
  if (current.grp === 'box' && (await boxCodes(db)).length <= 1) fail(400, 'Cần giữ ít nhất một loại hộp.');

  // Presets and products that point at this option would break, so the admin fixes or hides them first.
  const field = CHAR_FIELDS.find(([, grp]) => grp === current.grp)?.[0];
  const usedBy = (await db.select({ name: presets.name, box: presets.box, chars: presets.chars }).from(presets))
    .filter((p) => (current.grp === 'box' ? p.box === current.code : p.chars.some((ch) => ch[field] === current.code)))
    .map((p) => 'mẫu "' + p.name + '"');
  if (current.grp === 'box') {
    const prods = await db.select({ title: products.title }).from(products).where(eq(products.boxCode, current.code));
    usedBy.push(...prods.map((p) => 'sản phẩm "' + p.title + '"'));
  }
  if (usedBy.length) {
    fail(409, `Đang được dùng ở ${usedBy.slice(0, 5).join(', ')}${usedBy.length > 5 ? '...' : ''}. Sửa những chỗ đó trước, hoặc ẩn tùy chọn này thay vì xóa.`);
  }

  await db.delete(options).where(eq(options.id, current.id));
  await deleteUpload(c, current.layerKey);
  return c.json({ ok: true });
});

admin.get('/shop', async (c) => c.json(await loadShop(getDb(c))));

admin.put('/shop', async (c) => {
  const value = shopFields(await readJson(c));
  await getDb(c)
    .insert(settings)
    .values({ key: 'shop', value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  return c.json(value);
});

admin.put('/settings', async (c) => {
  const body = await readJson(c);
  const value = money(body.secondCharacterPrice, 'Giá nhân vật thứ hai');
  await getDb(c)
    .insert(settings)
    .values({ key: 'secondCharacterPrice', value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  return c.json({ secondCharacterPrice: value });
});

async function presetFields(c, body) {
  const f = {};
  if (body.name !== undefined) {
    f.name = str(body.name, 80);
    if (!f.name) fail(400, 'Tên mẫu không được để trống.');
  }
  if (body.box !== undefined) {
    if (!(await boxCodes(getDb(c))).includes(body.box)) fail(400, 'Loại hộp không hợp lệ.');
    f.box = body.box;
  }
  if (body.count !== undefined) f.count = int(body.count) === 2 ? 2 : 1;
  if (body.chars !== undefined) {
    if (!Array.isArray(body.chars) || !body.chars.length) fail(400, 'Mẫu cần ít nhất một nhân vật.');
    f.chars = body.chars.slice(0, 2).map(normalizeChar);
  }
  if (body.hidden !== undefined) f.hidden = !!body.hidden;
  if (body.sort !== undefined) f.sort = int(body.sort) || 0;
  return f;
}

admin.post('/presets', async (c) => {
  const fields = await presetFields(c, await readJson(c));
  if (!fields.name || !fields.box || !fields.chars) fail(400, 'Mẫu cần tên, loại hộp và nhân vật.');
  const [row] = await getDb(c).insert(presets).values(fields).returning();
  return c.json(row, 201);
});

admin.patch('/presets/:id', async (c) => {
  const fields = await presetFields(c, await readJson(c));
  const [row] = await getDb(c).update(presets).set(fields).where(eq(presets.id, int(c.req.param('id')))).returning();
  if (!row) fail(404, 'Không tìm thấy mẫu.');
  return c.json(row);
});

admin.delete('/presets/:id', async (c) => {
  await getDb(c).delete(presets).where(eq(presets.id, int(c.req.param('id'))));
  return c.json({ ok: true });
});

// ---------- Ready-made products ----------

admin.get('/products', async (c) => {
  const rows = await getDb(c).select().from(products).orderBy(products.id);
  return c.json(rows.map((p) => productOut(p)));
});

function variantsField(v) {
  if (!v) return null;
  const colors = (Array.isArray(v.colors) ? v.colors : [])
    .filter((x) => COLOR.test(x?.value) && str(x?.label, 30))
    .map((x) => ({ value: x.value, label: str(x.label, 30) }));
  const sizes = (Array.isArray(v.sizes) ? v.sizes : [])
    .filter((x) => str(x?.code, 20) && str(x?.label, 30))
    .map((x) => ({ code: slugify(x.code) || 'size', label: str(x.label, 30), price: money(x.price, 'Giá theo cỡ') }));
  return colors.length || sizes.length ? { colors, sizes } : null;
}

async function productFields(c, body) {
  const f = {};
  if (body.title !== undefined) {
    f.title = str(body.title, 100);
    if (!f.title) fail(400, 'Tên sản phẩm không được để trống.');
  }
  if (body.sub !== undefined) f.sub = str(body.sub, 120);
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) fail(400, 'Danh mục không hợp lệ.');
    f.category = body.category;
  }
  if (body.material !== undefined) {
    if (!MATERIALS.includes(body.material)) fail(400, 'Chất liệu không hợp lệ.');
    f.material = body.material;
  }
  if (body.price !== undefined) f.price = money(body.price, 'Giá');
  if (body.ready !== undefined) f.ready = !!body.ready;
  if (body.hidden !== undefined) f.hidden = !!body.hidden;
  if (body.wash !== undefined) {
    if (!COLOR.test(body.wash)) fail(400, 'Màu nền phải có dạng #rrggbb.');
    f.wash = body.wash;
  }
  if (body.description !== undefined) f.description = str(body.description, 3000);
  if (body.images !== undefined) f.images = (Array.isArray(body.images) ? body.images : []).map(uploadKey).filter(Boolean).slice(0, 12);
  if (body.variants !== undefined) f.variants = variantsField(body.variants);
  if (body.boxCode !== undefined) {
    if (body.boxCode !== null && !(await boxCodes(getDb(c))).includes(body.boxCode)) fail(400, 'Loại hộp không hợp lệ.');
    f.boxCode = body.boxCode;
  }
  if (body.chibiA !== undefined) f.chibiA = normalizeChar(body.chibiA);
  if (body.chibiB !== undefined) f.chibiB = body.chibiB ? normalizeChar(body.chibiB) : null;
  return f;
}

admin.post('/products', async (c) => {
  const db = getDb(c);
  const f = await productFields(c, await readJson(c));
  if (!f.title || f.price === undefined) fail(400, 'Sản phẩm cần tên và giá.');
  const [dupe] = await db.select({ id: products.id }).from(products).where(eq(products.title, f.title));
  if (dupe) fail(409, 'Đã có sản phẩm cùng tên.');
  let slug = slugify(f.title) || 'san-pham';
  const taken = await db.select({ slug: products.slug }).from(products).where(like(products.slug, `${slug}%`));
  if (taken.some((t) => t.slug === slug)) slug += '-' + (taken.length + 1);
  const [row] = await db
    .insert(products)
    .values({
      sub: '',
      category: 'go',
      material: 'Gỗ',
      wash: '#fddede',
      chibiA: normalizeChar({}),
      ...f,
      slug,
    })
    .returning();
  return c.json(productOut(row), 201);
});

admin.patch('/products/:id', async (c) => {
  const db = getDb(c);
  const f = await productFields(c, await readJson(c));
  if (f.title) {
    const [dupe] = await db.select({ id: products.id }).from(products).where(eq(products.title, f.title));
    if (dupe && dupe.id !== int(c.req.param('id'))) fail(409, 'Đã có sản phẩm cùng tên.');
  }
  const [row] = await db.update(products).set(f).where(eq(products.id, int(c.req.param('id')))).returning();
  if (!row) fail(404, 'Không tìm thấy sản phẩm.');
  return c.json(productOut(row));
});

// Past orders keep their own copy of the title and price, so deleting a product never changes them.
admin.delete('/products/:id', async (c) => {
  const db = getDb(c);
  const [row] = await db.delete(products).where(eq(products.id, int(c.req.param('id')))).returning();
  if (!row) fail(404, 'Không tìm thấy sản phẩm.');
  await Promise.all(row.images.map((k) => deleteUpload(c, k)));
  return c.json({ ok: true });
});

admin.post('/uploads', async (c) => {
  const form = await c.req.parseBody();
  const key = await saveUpload(c, form.file, { allowVideo: true, maxMb: 20 });
  return c.json({ key, url: mediaUrl(key) }, 201);
});

// ---------- Reports ----------
// Days are counted in Vietnam time (UTC+7); orders store UTC timestamps.

const VN_OFFSET = 7 * 3600e3;
const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

admin.get('/reports', async (c) => {
  const range = c.req.query('range') === 'month' ? 'month' : 'week';
  const now = new Date(Date.now() + VN_OFFSET);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start =
    range === 'week' ? today - ((now.getUTCDay() + 6) % 7) * 86400e3 : Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

  const db = c.env.DB;
  const [daily, statuses, unseen, customItems, boxRows] = await db.batch([
    db
      .prepare(
        `SELECT date(created_at, '+7 hours') AS day, SUM(total) AS revenue, COUNT(*) AS orders
           FROM orders WHERE date(created_at, '+7 hours') >= ? GROUP BY day`,
      )
      .bind(isoDay(start)),
    db.prepare(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`),
    db.prepare(`SELECT COUNT(*) AS n FROM orders WHERE seen_at IS NULL`),
    db.prepare(
      `SELECT i.design, i.qty FROM order_items i JOIN orders o ON o.id = i.order_id
        WHERE i.is_custom = 1 AND date(o.created_at, '+7 hours') >= ?`,
    ).bind(isoDay(start)),
    db.prepare(`SELECT code, label FROM options WHERE grp = 'box'`),
  ]);

  const byDay = new Map(daily.results.map((r) => [r.day, r]));
  let bars;
  if (range === 'week') {
    bars = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label, i) => ({
      label,
      revenue: byDay.get(isoDay(start + i * 86400e3))?.revenue ?? 0,
    }));
  } else {
    const days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    bars = Array.from({ length: Math.ceil(days / 7) }, (_, w) => ({ label: 'Tuần ' + (w + 1), revenue: 0 }));
    for (const r of daily.results) bars[Math.floor((Number(r.day.slice(8, 10)) - 1) / 7)].revenue += r.revenue;
  }

  // Box and option popularity over the same range, counted per character so a couple counts twice.
  const boxCount = {};
  const optCount = {};
  const labels = (await loadConfig(getDb(c), { includeHidden: true })).groups;
  const label = (grp, code) => labels[grp]?.find((o) => o.code === code)?.label ?? code;
  for (const row of customItems.results) {
    const d = JSON.parse(row.design || '{}');
    boxCount[d.box] = (boxCount[d.box] || 0) + row.qty;
    for (const ch of [d.a, d.b].filter(Boolean)) {
      const picks = [label('outfit', ch.outfit)];
      if (ch.accessory && ch.accessory !== 'none') picks.push(label('acc', ch.accessory));
      if (ch.glasses) picks.push(label('gl', 'glasses'));
      if (ch.beard) picks.push(label('gl', 'beard'));
      for (const p of picks) optCount[p] = (optCount[p] || 0) + row.qty;
    }
  }
  const top = (obj, n) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ label: name, count }));

  const statusCount = Object.fromEntries(statuses.results.map((r) => [r.status, r.n]));
  return c.json({
    range,
    bars,
    revenue: daily.results.reduce((s, r) => s + r.revenue, 0),
    orders: daily.results.reduce((s, r) => s + r.orders, 0),
    unseen: unseen.results[0].n,
    inProgress: ORDER_STATUSES.filter((s) => !['new', 'shipped'].includes(s.code)).reduce((s, x) => s + (statusCount[x.code] || 0), 0),
    statuses: ORDER_STATUSES.map((s) => ({ code: s.code, label: s.label, count: statusCount[s.code] || 0 })),
    boxes: top(
      Object.fromEntries(Object.entries(boxCount).map(([code, n]) => [boxRows.results.find((b) => b.code === code)?.label ?? code, n])),
      5,
    ),
    options: top(optCount, 5),
  });
});

export default admin;
