import type { MetadataRoute } from 'next';

/**
 * Robots configuration for 818 Capital Partners.
 * - Allows traditional search crawlers (Google, Bing) full access.
 * - Explicitly welcomes AI/answer-engine crawlers so we surface in
 *   ChatGPT, Claude, Perplexity, and Google AI Overviews.
 * - Blocks internal tools and API routes that should never be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.818capitalpartners.com';

  return {
    rules: [
      // Default: everyone else can index public content
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/command-center/', '/_next/', '/admin/'],
      },
      // Explicitly welcome AI / generative search crawlers
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' }, // Gemini / AI Overviews opt-in
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'Meta-ExternalAgent', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
