declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: { track: (...args: any[]) => void };
  }
}

export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}

export function trackFormView(lane: string) {
  trackEvent(`view_${lane}_form`);
}

export function trackFormSubmit(lane: string, loanAmount?: number) {
  trackEvent(`submit_${lane}_form`, { loan_type: lane, loan_amount: loanAmount });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_category: lane, value: loanAmount });
    window.ttq?.track('SubmitForm', { content_type: lane });
  }
}

export function trackPageView(page: string) {
  trackEvent(`view_${page}_page`);
}
