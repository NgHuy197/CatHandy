import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { mediaUrl } from '../shared/format';
import { requireUser } from './lib/auth';
import { saveUpload } from './lib/media';
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
app.get('/config', (c) => c.json({ googleClientId: c.env.GOOGLE_CLIENT_ID || null }));

app.route('/auth', auth);
app.route('/account', account);
app.route('/orders', orders);
app.route('/admin', admin);
app.route('/', catalog);

// Customers attach photos to reviews; the admin has its own larger upload under /admin/uploads.
app.post('/uploads', requireUser, async (c) => {
  const form = await c.req.parseBody();
  const key = await saveUpload(c, form.file, { maxMb: 5 });
  return c.json({ key, url: mediaUrl(key) }, 201);
});

// Uploaded files live in R2 under random keys, so they can be cached for good.
app.get('/media/:key{.+}', async (c) => {
  const obj = await c.env.MEDIA.get(c.req.param('key'));
  if (!obj) return c.json({ error: 'Không tìm thấy tệp' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(obj.body, { headers });
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Máy chủ gặp lỗi, bạn thử lại sau nhé.' }, 500);
});

export default app;
