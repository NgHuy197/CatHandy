import { eq } from 'drizzle-orm';
import { settings } from '../../db/schema';
import { normalizePhone } from '../../shared/format';
import { fail, str } from './util';

export const EMPTY_SHOP = { phone: '', email: '', zaloUrl: '', messengerUrl: '', shopeeUrl: '', facebookUrl: '' };

// The shop's public contact details, as the admin entered them in /admin/cai-dat.
export async function loadShop(db) {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'shop'));
  return { ...EMPTY_SHOP, ...(row?.value || {}) };
}

const httpsUrl = (v, what) => {
  const s = str(v, 300);
  if (s && !/^https:\/\/[^\s]+$/.test(s)) fail(400, `${what} phải là đường dẫn bắt đầu bằng https://`);
  return s;
};

export function shopFields(body) {
  const email = str(body.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Email chưa đúng định dạng.');
  // A bare phone number for Zalo becomes its zalo.me link.
  const zalo = str(body.zaloUrl, 300);
  const zaloUrl = /^[\d\s.+-]+$/.test(zalo) ? 'https://zalo.me/' + normalizePhone(zalo).replace(/^\+84/, '0') : httpsUrl(zalo, 'Link Zalo');
  return {
    phone: normalizePhone(str(body.phone, 30)),
    email,
    zaloUrl,
    messengerUrl: httpsUrl(body.messengerUrl, 'Link Messenger'),
    shopeeUrl: httpsUrl(body.shopeeUrl, 'Link Shopee'),
    facebookUrl: httpsUrl(body.facebookUrl, 'Link Fanpage'),
  };
}
