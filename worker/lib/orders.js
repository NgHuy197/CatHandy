import { inArray } from 'drizzle-orm';
import { orderItems, orderNotes, orderPhotos } from '../../db/schema';
import { mediaUrl } from '../../shared/format';

// Random rather than sequential, so nobody can walk the tracking page through other people's orders.
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const newOrderCode = () =>
  'CH-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => CODE_CHARS[b % 32]).join('');

export const ORDER_CODE = /^CH-[0-9A-Z]{4,12}$/;

// Attaches items and photos to order rows. level 'public' (tracking page) drops the customer's design note;
// 'admin' also attaches the internal and revision notes.
export async function withDetails(db, rows, level = 'public') {
  if (!rows.length) return [];
  const ids = rows.map((o) => o.id);
  const [items, photos, notes] = await Promise.all([
    db.select().from(orderItems).where(inArray(orderItems.orderId, ids)).orderBy(orderItems.id),
    db.select().from(orderPhotos).where(inArray(orderPhotos.orderId, ids)).orderBy(orderPhotos.id),
    level === 'admin'
      ? db.select().from(orderNotes).where(inArray(orderNotes.orderId, ids)).orderBy(orderNotes.id)
      : [],
  ]);
  return rows.map(({ id, ...order }) => ({
    ...order,
    items: items
      .filter((i) => i.orderId === id)
      .map(({ id: _, orderId, design, ...item }) => ({
        ...item,
        design: design && level === 'public' ? { ...design, note: undefined } : design,
      })),
    photos: photos.filter((p) => p.orderId === id).map((p) => ({ id: p.id, url: mediaUrl(p.key) })),
    ...(level === 'admin' ? { notes: notes.filter((n) => n.orderId === id).map(({ orderId, ...n }) => n) } : {}),
  }));
}
