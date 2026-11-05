import { and, eq, gt } from 'drizzle-orm';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { sessions, users } from '../../db/schema';
import { fail, getDb } from './util';

const COOKIE = 'ch_session';
const SESSION_DAYS = 30;
// The Workers runtime caps PBKDF2 at 100k iterations.
const PBKDF2_ITERATIONS = 100000;

const enc = new TextEncoder();
const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (s) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));
const hex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iterations, salt, expected] = String(stored || '').split('$');
  if (scheme !== 'pbkdf2' || !expected) return false;
  const actual = b64(await pbkdf2(password, unb64(salt), Number(iterations)));
  // Constant-time compare, so the response time does not leak how much of the hash matched.
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i % expected.length);
  return diff === 0;
}

export async function startSession(c, userId) {
  const token = b64(crypto.getRandomValues(new Uint8Array(32))).replace(/[+/=]/g, (ch) => ({ '+': '-', '/': '_', '=': '' })[ch]);
  await getDb(c)
    .insert(sessions)
    .values({ id: await sha256(token), userId, expiresAt: Date.now() + SESSION_DAYS * 86400e3 });
  setCookie(c, COOKIE, token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: SESSION_DAYS * 86400 });
}

export async function endSession(c) {
  const token = getCookie(c, COOKIE);
  if (token) await getDb(c).delete(sessions).where(eq(sessions.id, await sha256(token)));
  deleteCookie(c, COOKIE, { path: '/', secure: true });
}

// The signed-in user for this request, or null. Looked up once per request.
export async function currentUser(c) {
  if (c.get('user') !== undefined) return c.get('user');
  const token = getCookie(c, COOKIE);
  let user = null;
  if (token) {
    const [row] = await getDb(c)
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.id, await sha256(token)), gt(sessions.expiresAt, Date.now())));
    user = row?.user ?? null;
  }
  c.set('user', user);
  return user;
}

export const requireUser = createMiddleware(async (c, next) => {
  if (!(await currentUser(c))) fail(401, 'Bạn cần đăng nhập để tiếp tục.');
  await next();
});

export const requireAdmin = createMiddleware(async (c, next) => {
  const user = await currentUser(c);
  if (!user) fail(401, 'Bạn cần đăng nhập để tiếp tục.');
  if (user.role !== 'admin') fail(403, 'Tài khoản này không có quyền quản trị.');
  await next();
});

// Emails listed in ADMIN_EMAILS (comma separated) become admins when they sign in.
export const isAdminEmail = (env, email) =>
  String(env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());

export const publicUser = (u) =>
  u && {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    address: u.address,
    role: u.role,
    hasPassword: !!u.passwordHash,
    hasGoogle: !!u.googleSub,
  };
