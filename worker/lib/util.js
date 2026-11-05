import { drizzle } from 'drizzle-orm/d1';
import { HTTPException } from 'hono/http-exception';
import * as schema from '../../db/schema';

export const getDb = (c) => drizzle(c.env.DB, { schema });

export const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const int = (v) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? n : NaN;
};

export const readJson = (c) => c.req.json().catch(() => ({}));

// Throws a JSON error the client shows as-is; see app.onError in worker/index.js.
export const fail = (status, message) => {
  throw new HTTPException(status, { message });
};
