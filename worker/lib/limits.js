import { createMiddleware } from 'hono/factory';
import { currentUser } from './auth';
import { fail } from './util';

const ipOf = (c) => c.req.header('cf-connecting-ip') || 'local';

// Refuses a request once this visitor has used up the binding's per-minute allowance (see "ratelimits" in
// wrangler.jsonc). Keyed by IP, or by account when `byUser` is set and someone is signed in.
export const rateLimit = (binding, { byUser = false } = {}) =>
  createMiddleware(async (c, next) => {
    const limiter = c.env[binding];
    if (limiter) {
      const user = byUser ? await currentUser(c) : null;
      const { success } = await limiter.limit({ key: user ? 'u' + user.id : ipOf(c) });
      if (!success) fail(429, 'Bạn thao tác nhanh quá, đợi một phút rồi thử lại nhé.');
    }
    await next();
  });

export const limitOrders = rateLimit('RL_ORDER');
export const limitAuth = rateLimit('RL_AUTH');
export const limitLookup = rateLimit('RL_LOOKUP');
export const limitUploads = rateLimit('RL_UPLOAD', { byUser: true });
