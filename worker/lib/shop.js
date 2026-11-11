import { eq, like } from 'drizzle-orm';
import { settings } from '../../db/schema';
import { normalizePhone } from '../../shared/format';
import { POLICIES, POLICY_MAX } from '../../shared/policies';
import { fail, str } from './util';

// ownerName, businessId and address are the seller details a Vietnamese shop site shows in its footer;
// bctUrl is the confirmation link online.gov.vn gives once the site is registered with the Ministry of Industry and Trade.
export const EMPTY_SHOP = {
  phone: '',
  email: '',
  zaloUrl: '',
  messengerUrl: '',
  shopeeUrl: '',
  facebookUrl: '',
  ownerName: '',
  businessId: '',
  address: '',
  bctUrl: '',
};

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
  const zaloUrl = /^[\d\s.+-]+$/.test(zalo) ? 'https://zalo.me/' + normalizePhone(zalo) : httpsUrl(zalo, 'Link Zalo');
  return {
    phone: normalizePhone(str(body.phone, 30)),
    email,
    zaloUrl,
    messengerUrl: httpsUrl(body.messengerUrl, 'Link Messenger'),
    shopeeUrl: httpsUrl(body.shopeeUrl, 'Link Shopee'),
    facebookUrl: httpsUrl(body.facebookUrl, 'Link Fanpage'),
    ownerName: str(body.ownerName, 200),
    businessId: str(body.businessId, 100),
    address: str(body.address, 300),
    bctUrl: httpsUrl(body.bctUrl, 'Link thông báo Bộ Công Thương'),
  };
}

const policyKey = (key) => 'policy:' + key;

// Slugs of the policy pages that have text, so the footer and checkout link only to pages that exist.
export async function filledPolicies(db) {
  const rows = await db.select({ key: settings.key }).from(settings).where(like(settings.key, 'policy:%'));
  const keys = new Set(rows.map((r) => r.key));
  return POLICIES.filter((p) => keys.has(policyKey(p.key))).map((p) => p.slug);
}

export async function loadPolicy(db, key) {
  const [row] = await db.select().from(settings).where(eq(settings.key, policyKey(key)));
  return typeof row?.value === 'string' ? row.value : '';
}

export async function loadPolicies(db) {
  const texts = await Promise.all(POLICIES.map((p) => loadPolicy(db, p.key)));
  return Object.fromEntries(POLICIES.map((p, i) => [p.key, texts[i]]));
}

// Saves every policy in one batch: text is upserted, an emptied page loses its row and disappears from the site.
export async function savePolicies(db, body) {
  const value = Object.fromEntries(POLICIES.map((p) => [p.key, str(body[p.key], POLICY_MAX)]));
  await db.batch(
    POLICIES.map((p) =>
      value[p.key]
        ? db
            .insert(settings)
            .values({ key: policyKey(p.key), value: value[p.key] })
            .onConflictDoUpdate({ target: settings.key, set: { value: value[p.key] } })
        : db.delete(settings).where(eq(settings.key, policyKey(p.key))),
    ),
  );
  return value;
}
