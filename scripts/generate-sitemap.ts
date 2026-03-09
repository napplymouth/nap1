ts
// generate-sitemap.ts
// This script generates sitemap.xml and robots.txt files in the public directory.

import { writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------
const SITE_URL = (process.env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '');
const TODAY = new Date().toISOString().split('T')[0];

const pages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/training', changefreq: 'weekly', priority: '0.9' },
  { path: '/get-naloxone', changefreq: 'weekly', priority: '0.9' },
  { path: '/volunteer', changefreq: 'monthly', priority: '0.7' },
  { path: '/resources', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

// ------------------------------------------------------------
// Helper: generate XML safely
// ------------------------------------------------------------
function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

// ------------------------------------------------------------
// Build sitemap.xml content
// ------------------------------------------------------------
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${p.path === '/' ? '/' : p.path}`)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

// ------------------------------------------------------------
// Build robots.txt content
// ------------------------------------------------------------
const robots = `User-agent: *
Allow: /
Allow: /about
Allow: /training
Allow: /get-naloxone
Allow: /volunteer
Allow: /resources
Allow: /contact
Sitemap: ${SITE_URL}/sitemap.xml`;

// ------------------------------------------------------------
// Write files with error handling
// ------------------------------------------------------------
try {
  const publicDir = resolve(process.cwd(), 'public');

  // Ensure the directory exists; if not, create it
  // (fs.writeFileSync will throw if the path is invalid)
  writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf-8');
  writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf-8');

  console.log(`[generate-sitemap] Domain: ${SITE_URL}`);
  console.log('[generate-sitemap] sitemap.xml and robots.txt updated successfully.');
} catch (err) {
  console.error('[generate-sitemap] Failed to write files:', err);
  process.exit(1);
}
