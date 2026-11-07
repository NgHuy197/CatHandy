import { Hono } from 'hono';
import { and, desc, eq, sql } from 'drizzle-orm';
import { orderItems, orders, products, reviews, users } from '../../db/schema';
import { mediaUrl } from '../../shared/format';
import { currentUser, requireUser } from '../lib/auth';
import { loadConfig } from '../lib/customizer';
import { limitUploads } from '../lib/limits';
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

// Reviews come only from accounts whose order of the product has been handed to the courier.
async function hasReceived(db, userId, slug) {
  const [row] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.userId, userId), eq(orders.status, 'shipped'), eq(orderItems.productSlug, slug)))
    .limit(1);
  return !!row;
}

catalog.get('/products/:slug', async (c) => {
  const db = getDb(c);
  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, c.req.param('slug')), eq(products.hidden, false)));
  if (!p) fail(404, 'Không tìm thấy sản phẩm.');
  const user = await currentUser(c);
  const [list, [rating], canReview] = await Promise.all([
    db
      .select({ id: reviews.id, rating: reviews.rating, body: reviews.body, photos: reviews.photos, createdAt: reviews.createdAt, name: users.name })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.productId, p.id))
      .orderBy(desc(reviews.id))
      .limit(50),
    db.select(ratingFields).from(reviews).where(eq(reviews.productId, p.id)).groupBy(reviews.productId),
    user ? hasReceived(db, user.id, p.slug) : false,
  ]);
  return c.json({
    ...productOut(p, rating),
    reviews: list.map((r) => ({ ...r, photoUrls: r.photos.map(mediaUrl) })),
    // Lets the page show the form only to accounts the POST below will accept.
    canReview,
  });
});

// Writing again replaces the earlier review, so one customer counts once in the rating.
catalog.post('/products/:slug/reviews', requireUser, limitUploads, async (c) => {
  const db = getDb(c);
  const user = await currentUser(c);
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.slug, c.req.param('slug')));
  if (!p) fail(404, 'Không tìm thấy sản phẩm.');
  if (!(await hasReceived(db, user.id, c.req.param('slug'))))
    fail(403, 'Bạn đánh giá được khi đơn có sản phẩm này đã được giao.');

  const body = await readJson(c);
  const rating = int(body.rating);
  if (!(rating >= 1 && rating <= 5)) fail(400, 'Bạn chọn từ 1 đến 5 sao nhé.');
  const photos = (Array.isArray(body.photos) ? body.photos : [])
    .map((k) => str(k, 200))
    .filter((k) => k.startsWith('uploads/'))
    .slice(0, 6);
  const fields = { rating, body: str(body.body, 2000), photos };
  const [review] = await db
    .insert(reviews)
    .values({ productId: p.id, userId: user.id, ...fields })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.productId],
      set: { ...fields, createdAt: sql`CURRENT_TIMESTAMP` },
    })
    .returning();
  return c.json({ ...review, name: user.name, photoUrls: photos.map(mediaUrl) });
});

catalog.get('/customizer', async (c) => c.json(await loadConfig(getDb(c))));

export default catalog;
