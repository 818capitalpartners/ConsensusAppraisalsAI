/**
 * UTM capture — grabs UTM params from URL on landing,
 * persists to sessionStorage, attaches to deal submissions.
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;       // Google Ads click ID
  fbclid?: string;      // Meta click ID
  ttclid?: string;      // TikTok click ID
  landing_page?: string;
  referrer?: string;
}

const UTM_STORAGE_KEY = '818_utm_params';

export function captureUTMParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ttclid'];

  const captured: UTMParams = {};
  let hasAny = false;

  for (const key of utmKeys) {
    const val = params.get(key);
    if (val) {
      (captured as Record<string, string>)[key] = val;
      hasAny = true;
    }
  }

  // Always capture landing page and referrer on first visit
  if (!sessionStorage.getItem(UTM_STORAGE_KEY)) {
    captured.landing_page = window.location.pathname;
    captured.referrer = document.referrer || undefined;
    hasAny = true;
  }

  if (hasAny) {
    // Merge with existing (don't overwrite if already captured)
    const existing = getUTMParams();
    const merged = { ...captured, ...existing };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
  }
}

export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getChannel(): string {
  const utm = getUTMParams();
  if (utm.gclid) return 'google_ads';
  if (utm.fbclid) return 'meta_ads';
  if (utm.ttclid) return 'tiktok_ads';
  if (utm.utm_source) return utm.utm_source;
  if (utm.referrer?.includes('google')) return 'organic_google';
  if (utm.referrer?.includes('facebook') || utm.referrer?.includes('instagram')) return 'organic_social';
  return 'direct';
}
