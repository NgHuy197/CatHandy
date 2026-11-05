import { Hono } from 'hono';
import { and, desc, eq, sql } from 'drizzle-orm';
import { orderItems, orders, products, reviews, users } from '../../db/schema';
import { mediaUrl } from '../../shared/format';
import { currentUser, requireUser } from '../lib/auth';
import { loadConfig } from '../lib/customizer';
import { fail, getDb, int, readJson, str } from '../lib/util';

const catalog = new Hono();

export const productOut = (p, rating) => ({
  ...p,
  imageUrls: (p.images || []).map(mediaUrl),
  rating: rating ? { avg: Math.round(rating.avg * 10) / 10, count: rating.count } : { avg: 0, count: 0 },
});

const ratingFields = {
  productId: reviews.productId,
  avg: sql`avg(${reviews.rating})`.mapWith(Number),
  count: sql`count(*)`.mapWith(Number),
};

catalog.get('/products', async (c) => {
  const db = getDb(c);
  const [rows, ratings] = await Promise.all([
    db.select().from(products).where(eq(products.hidden, false)).orderBy(products.id),
    db.select(ratingFields).from(reviews).groupBy(reviews.productId),
  ]);
  return c.json(rows.map((p) => productOut(p, ratings.find((r) => r.productId === p.id))));
});

catalog.get('/products/:slug', async (c) => {
  const db = getDb(c);
  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, c.req.param('slug')), eq(products.hidden, false)));
  if (!p) fail(404, 'Không tìm thấy sản phẩm.');
  const [list, [rating]] = await Promise.all([
    db
      .select({ id: reviews.id, rating: reviews.rating, body: reviews.body, photos: reviews.photos, createdAt: reviews.createdAt, name: users.name })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.productId, p.id))
      .orderBy(desc(reviews.id))
      .limit(50),
    db.select(ratingFields).from(reviews).where(eq(reviews.productId, p.id)).groupBy(reviews.productId),
  ]);
  return c.json({
    ...productOut(p, rating),
    reviews: list.map((r) => ({ ...r, photoUrls: r.photos.map(mediaUrl) })),
  });
});

// Reviews come only from accounts that have ordered the product.
catalog.post('/products/:slug/reviews', requireUser, async (c) => {
  const db = getDb(c);
  const user = await currentUser(c);
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.slug, c.req.param('slug')));
  if (!p) fail(404, 'Không tìm thấy sản phẩm.');
  const [bought] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.userId, user.id), eq(orderItems.productSlug, c.req.param('slug'))))
    .limit(1);
  if (!bought) fail(403, 'Bạn đánh giá được sau khi đã đặt mua sản phẩm này.');

  const body = await readJson(c);
  const rating = int(body.rating);
  if (!(rating >= 1 && rating <= 5)) fail(400, 'Bạn chọn từ 1 đến 5 sao nhé.');
  const photos = (Array.isArray(body.photos) ? body.photos : [])
    .map((k) => str(k, 200))
    .filter((k) => k.startsWith('uploads/'))
    .slice(0, 6);
  const [review] = await db
    .insert(reviews)
    .values({ productId: p.id, userId: user.id, rating, body: str(body.body, 2000), photos })
    .returning();
  return c.json({ ...review, name: user.name, photoUrls: photos.map(mediaUrl) }, 201);
});

catalog.get('/customizer', async (c) => c.json(await loadConfig(getDb(c))));

export default catalog;
