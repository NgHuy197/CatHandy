import { defineConfig } from 'drizzle-kit';

// Generates SQL into migrations/; Wrangler applies it to D1 (see the db:* scripts).
export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema.js',
  out: './migrations',
});
