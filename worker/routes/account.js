import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import { orders, products, users, wishlist } from '../../db/schema';
import { normalizePhone } from '../../shared/format';
import { currentUser, publicUser, requireUser } from '../lib/auth';
import { withDetails } from '../lib/orders';
import { fail, getDb, readJson, str } from '../lib/util';
import { productOut } from './catalog';

const account = new Hono();
account.use(requireUser);

account.patch('/', async (c) => {
  const user = await currentUser(c);
  const body = await readJson(c);
  const patch = {};
  if (body.name !== undefined) patch.name = str(body.name, 100);
  if (body.phone !== undefined) patch.phone = normalizePhone(str(body.phone, 30));
  if (body.address !== undefined) patch.address = str(body.address, 500);
  if (patch.name === '') fail(400, 'Họ tên không được để trống.');
  const [updated] = await getDb(c).update(users).set(patch).where(eq(users.id, user.id)).returning();
  return c.json({ user: publicUser(updated) });
});

account.get('/orders', async (c) => {
  const user = await currentUser(c);
  const db = getDb(c);
  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      total: orders.total,
      customerName: orders.customerName,
      phone: orders.phone,
      address: orders.address,
      note: orders.note,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.id))
    .limit(50);
  return c.json(await withDetails(db, rows, 'owner'));
});

account.get('/wishlist', async (c) => {
  const user = await currentUser(c);
  const rows = await getDb(c)
    .select({ product: products })
    .from(wishlist)
    .innerJoin(products, eq(products.id, wishlist.productId))
    .where(and(eq(wishlist.userId, user.id), eq(products.hidden, false)))
    .orderBy(desc(wishlist.createdAt));
  return c.json(rows.map((r) => productOut(r.product)));
});

async function productId(c) {
  const [p] = await getDb(c).select({ id: products.id }).from(products).where(eq(products.slug, c.req.param('slug')));
  if (!p) fail(404, 'Không tìm thấy sản phẩm.');
  return p.id;
}

account.put('/wishlist/:slug', async (c) => {
  const user = await currentUser(c);
  await getDb(c)
    .insert(wishlist)
    .values({ userId: user.id, productId: await productId(c) })
    .onConflictDoNothing();
  return c.json({ ok: true });
});

account.delete('/wishlist/:slug', async (c) => {
  const user = await currentUser(c);
  await getDb(c)
    .delete(wishlist)
    .where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, await productId(c))));
  return c.json({ ok: true });
});

export default account;
