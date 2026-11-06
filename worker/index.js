import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { mediaUrl } from '../shared/format';
import { requireUser } from './lib/auth';
import { saveUpload } from './lib/media';
import { loadShop } from './lib/shop';
import { limitUploads } from './lib/limits';
import { getDb } from './lib/util';
import account from './routes/account';
import admin from './routes/admin';
import auth from './routes/auth';
import catalog from './routes/catalog';
import orders from './routes/orders';

// Only /api/* reaches this Worker (see run_worker_first in wrangler.jsonc); everything else is the built React app.
const app = new Hono().basePath('/api');

// Rejects form posts from other sites; the session cookie is SameSite=Lax as a second line.
app.use(csrf());

app.get('/health', (c) => c.json({ ok: true }));

// Public settings the browser needs before anyone signs in.
app.get('/config', async (c) =>
  c.json({ googleClientId: c.env.GOOGLE_CLIENT_ID || null, shop: await loadShop(getDb(c)) }),
);

app.route('/auth', auth);
app.route('/account', account);
app.route('/orders', orders);
app.route('/admin', admin);
app.route('/', catalog);

// Customers attach photos to reviews; the admin has its own larger upload under /admin/uploads.
app.post('/uploads', requireUser, limitUploads, async (c) => {
  const form = await c.req.parseBody();
  const key = await saveUpload(c, form.file, { maxMb: 5 });
  return c.json({ key, url: mediaUrl(key) }, 201);
});

// A single "bytes=a-b", "bytes=a-" or "bytes=-n" range as [start, end] within `size`; null for none or several.
function byteRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!m || (!m[1] && !m[2])) return null;
  if (!m[1]) return [Math.max(size - Number(m[2]), 0), size - 1];
  return [Number(m[1]), Math.min(m[2] ? Number(m[2]) : size - 1, size - 1)];
}

// Uploaded files live in R2 under random keys, so they can be cached for good.
// Range requests are answered with 206, which Safari needs before it will play a video.
app.get('/media/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const head = c.req.header('range') ? await c.env.MEDIA.head(key) : null;
  const range = head && byteRange(c.req.header('range'), head.size);
  if (range && range[0] > range[1]) {
    return new Response(null, { status: 416, headers: { 'content-range': `bytes */${head.size}` } });
  }
  const obj = await c.env.MEDIA.get(key, range ? { range: { offset: range[0], length: range[1] - range[0] + 1 } } : undefined);
  if (!obj) return c.json({ error: 'Không tìm thấy tệp' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');
  if (range) {
    headers.set('content-range', `bytes ${range[0]}-${range[1]}/${obj.size}`);
    headers.set('content-length', String(range[1] - range[0] + 1));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('content-length', String(obj.size));
  return new Response(obj.body, { headers });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Máy chủ gặp lỗi, bạn thử lại sau nhé.' }, 500);
});

export default app;
