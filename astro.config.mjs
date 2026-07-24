// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production domain. Set from the start (even while previewing on github.io) so
  // canonical URLs, sitemap entries and social cards are correct on launch day.
  site: 'https://tylercherman.com',

  integrations: [sitemap()],

  // Preserve the Squarespace site's indexed URLs. The work grid now lives at /,
  // so these would otherwise 404 and throw away accumulated search authority.
  // See PLAN.md §7.1.
  redirects: {
    '/work': '/',
    '/work-1': '/',
  },

  build: {
    // Cleaner URLs: /about rather than /about/
    format: 'file',
  },
});
