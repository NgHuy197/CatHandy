import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema';
import {
  currentUser,
  endSession,
  hashPassword,
  isAdminEmail,
  publicUser,
  startSession,
  verifyPassword,
} from '../lib/auth';
import { limitAuth } from '../lib/limits';
import { fail, getDb, readJson, str } from '../lib/util';

const auth = new Hono();

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// A well-formed hash no password matches, checked when the account does not exist.
const DUMMY_HASH = 'pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

// Signs the user in. ADMIN_EMAILS promotes only when the email is proven (Google says email_verified):
// password sign-ups never confirm the address, so whoever registered an admin's email first would get in.
async function signIn(c, user, { emailVerified = false } = {}) {
  if (emailVerified && user.role !== 'admin' && isAdminEmail(c.env, user.email)) {
    await getDb(c).update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
    user = { ...user, role: 'admin' };
  }
  await startSession(c, user.id);
  return c.json({ user: publicUser(user) });
}

auth.get('/me', async (c) => c.json({ user: publicUser(await currentUser(c)) }));

auth.use('/register', limitAuth);
auth.use('/login', limitAuth);
auth.use('/google', limitAuth);

auth.post('/register', async (c) => {
  const body = await readJson(c);
  const name = str(body.name, 100);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!name) fail(400, 'Bạn nhập họ tên nhé.');
  if (!EMAIL.test(email)) fail(400, 'Email chưa đúng định dạng.');
  if (password.length < 8 || password.length > 200) fail(400, 'Mật khẩu cần ít nhất 8 ký tự.');

  const db = getDb(c);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) fail(409, 'Email này đã có tài khoản. Bạn đăng nhập nhé.');
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .returning();
  return signIn(c, user);
});

auth.post('/login', async (c) => {
  const body = await readJson(c);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const [user] = await getDb(c).select().from(users).where(eq(users.email, email));
  // Same message and the same hashing work whether the email or the password is wrong, so neither the reply nor
  // its timing reveals who has an account. Google-only accounts have no hash and check against the dummy too.
  const ok = await verifyPassword(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !ok) fail(401, 'Email hoặc mật khẩu chưa đúng.');
  return signIn(c, user);
});

// Google One-Tap: the browser sends the ID token Google gave it; Google's tokeninfo endpoint checks the signature.
auth.post('/google', async (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) fail(501, 'Shop chưa bật đăng nhập Google.');
  const credential = str((await readJson(c)).credential, 4096);
  if (!credential) fail(400, 'Thiếu thông tin đăng nhập Google.');
  const res = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
  const info = res.ok ? await res.json() : null;
  if (!info || info.aud !== c.env.GOOGLE_CLIENT_ID || String(info.email_verified) !== 'true') {
    fail(401, 'Không xác minh được tài khoản Google, bạn thử lại nhé.');
  }

  const db = getDb(c);
  const email = String(info.email).toLowerCase();
  let [user] = await db.select().from(users).where(eq(users.googleSub, info.sub));
  if (!user) {
    const [byEmail] = await db.select().from(users).where(eq(users.email, email));
    if (byEmail) {
      // Password sign-ups never prove they own the email, so a Google sign-in must not take over such an account.
      if (byEmail.passwordHash) fail(409, 'Email này đã đăng ký bằng mật khẩu. Bạn đăng nhập bằng mật khẩu nhé.');
      [user] = await db.update(users).set({ googleSub: info.sub }).where(eq(users.id, byEmail.id)).returning();
    } else {
      [user] = await db
        .insert(users)
        .values({ email, name: str(info.name, 100) || email.split('@')[0], googleSub: info.sub })
        .returning();
    }
  }
  return signIn(c, user, { emailVerified: true });
});

auth.post('/logout', async (c) => {
  await endSession(c);
  return c.json({ ok: true });
});

export default auth;
