/**
 * Analytics helpers — GA4 event tracking.
 * All pixel IDs come from env vars prefixed NEXT_PUBLIC_.
 * Gracefully no-ops when IDs not set.
 */

// Extend window for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
    ttq: { track: (...args: unknown[]) => void; page: () => void };
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Pre-built conversion events
export const analytics = {
  formStart: (lane: string) =>
    trackEvent('form_start', { lane, category: 'engagement' }),

  formSubmit: (lane: string, score?: string) =>
    trackEvent('form_submit', {
      lane,
      score,
      category: 'conversion',
      value: 1,
    }),

  dealCreated: (lane: string, score: string, lenderCount: number) =>
    trackEvent('deal_created', {
      lane,
      score,
      lender_count: lenderCount,
      category: 'conversion',
      value: 1,
    }),

  ctaClick: (ctaName: string, location: string) =>
    trackEvent('cta_click', { cta_name: ctaName, location, category: 'engagement' }),

  pageView: (pagePath: string, pageTitle: string) =>
    trackEvent('page_view', { page_path: pagePath, page_title: pageTitle }),

  blogRead: (slug: string, title: string) =>
    trackEvent('blog_read', { slug, title, category: 'content' }),

  brokerSignup: () =>
    trackEvent('broker_signup', { category: 'conversion', value: 1 }),

  // Meta Pixel conversions
  metaLead: (lane: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', { content_category: lane });
    }
  },

  // TikTok conversions
  tiktokLead: (lane: string) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('SubmitForm', { content_type: lane });
    }
  },
};
