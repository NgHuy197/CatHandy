import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

// Zalo and Facebook link previews only accept absolute URLs, so a production build with SITE_URL set
// (in .env.production or the shell) rewrites og:image to the full address and adds og:url.
function absoluteOgTags(siteUrl) {
  const base = (siteUrl || '').replace(/\/+$/, '');
  return {
    name: 'absolute-og-tags',
    apply: 'build',
    transformIndexHtml(html) {
      if (!base) {
        console.warn('\n[cat-handy] SITE_URL is not set: link previews on Zalo/Facebook will have no image.\n');
        return html;
      }
      return html
        .replace('content="/logo.webp"', `content="${base}/logo.webp"`)
        .replace('<meta property="og:type"', `<meta property="og:url" content="${base}/" />\n    <meta property="og:type"`);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), cloudflare(), absoluteOgTags(loadEnv(mode, process.cwd(), '').SITE_URL)],
}));
