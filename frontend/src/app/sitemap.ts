import type { MetadataRoute } from 'next';
import { MARKETS } from '@/data/markets';
import { LOAN_PROGRAMS } from '@/data/loan-programs';
import { STATES } from '@/data/states';
import FUNDED_DEALS from '@/data/fundedDeals';
import { POSTS } from '@/lib/blog-data';

/**
 * Sitemap for 818 Capital Partners.
 * - Core pages hand-curated below.
 * - Programmatic pages (/markets/[location]/[loan]) auto-generated
 *   from /data/markets.ts × /data/loan-programs.ts.
 * - Closed-deal pages (/closed-deals/[id]) auto-generated from fundedDeals.
 * - Blog posts auto-generated from POSTS.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.818capitalpartners.com';
  const now = new Date();

  const corePages: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    // Home
    { path: '',                     priority: 1.0, changeFreq: 'weekly' },

    // Product / loan-program pages (highest commercial intent)
    { path: '/dscr-loans',          priority: 0.95, changeFreq: 'weekly' },
    { path: '/fix-and-flip',        priority: 0.95, changeFreq: 'weekly' },
    { path: '/str-loans',           priority: 0.95, changeFreq: 'weekly' },
    { path: '/multifamily',         priority: 0.95, changeFreq: 'weekly' },

    // Trust & conversion pages
    { path: '/closed-deals',        priority: 0.9,  changeFreq: 'weekly' },
    { path: '/about',               priority: 0.7,  changeFreq: 'monthly' },
    { path: '/broker-program',      priority: 0.8,  changeFreq: 'monthly' },
    { path: '/professionals',       priority: 0.6,  changeFreq: 'monthly' },
    { path: '/markets',             priority: 0.8,  changeFreq: 'monthly' },
    { path: '/resources',           priority: 0.7,  changeFreq: 'weekly' },

    // Content hubs
    { path: '/blog',                priority: 0.7,  changeFreq: 'weekly' },
    { path: '/insights',            priority: 0.7,  changeFreq: 'weekly' },

    // Evergreen playbooks (high dwell, citation-worthy)
    { path: '/dscr-playbook-2026',  priority: 0.85, changeFreq: 'monthly' },
    { path: '/fix-flip-playbook-2026', priority: 0.85, changeFreq: 'monthly' },
    { path: '/str-playbook-2026',   priority: 0.85, changeFreq: 'monthly' },
  ];

  const core: MetadataRoute.Sitemap = corePages.map(({ path, priority, changeFreq }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }));

  // State hubs (only states with real city coverage)
  const stateHubs: MetadataRoute.Sitemap = STATES.map((s) => ({
    url: `${base}/markets/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  // City hubs (every market gets a city-level landing page)
  const cityHubs: MetadataRoute.Sitemap = MARKETS.map((m) => ({
    url: `${base}/markets/${m.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Programmatic SEO: every (market × loan-program) combo
  const programmatic: MetadataRoute.Sitemap = [];
  for (const m of MARKETS) {
    for (const p of LOAN_PROGRAMS) {
      programmatic.push({
        url: `${base}/markets/${m.slug}/${p.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
      });
    }
  }

  // Individual closed-deal pages (long-tail: city + loan type + property type)
  const dealPages: MetadataRoute.Sitemap = FUNDED_DEALS.map((d) => ({
    url: `${base}/closed-deals/${d.id}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.65,
  }));

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...core, ...stateHubs, ...cityHubs, ...programmatic, ...dealPages, ...blogPages];
}
