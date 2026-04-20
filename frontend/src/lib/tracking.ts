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

export function trackLeadMagnetDownload(guide: string) {
  trackEvent('lead_magnet_download', { guide });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_category: 'lead_magnet', content_name: guide });
  }
}

export function trackExitIntentShow() {
  trackEvent('exit_intent_shown');
}

export function trackExitIntentConvert() {
  trackEvent('exit_intent_converted');
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_category: 'exit_intent' });
  }
}

export function trackChatOpen() {
  trackEvent('chat_widget_opened');
}

export function trackChatLead(dealType: string) {
  trackEvent('chat_lead_captured', { deal_type: dealType });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_category: 'chatbot', content_name: dealType });
  }
}

/**
 * Universal "lead captured on the server" event. Fire after /api/contacts
 * or /api/deals confirms the lead was saved. This is the event we marked
 * as a GA4 Key Event on 2026-04-19, so it flows through to GA4 conversions
 * and Meta's "Lead" standard event.
 */
export function trackGenerateLead(params?: { source?: string; value?: number; program?: string }) {
  trackEvent('generate_lead', params);
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', {
      content_category: params?.source,
      content_name: params?.program,
      value: params?.value ?? 0,
      currency: 'USD',
    });
    window.ttq?.track('SubmitForm', { content_type: params?.source });
  }
}

export function trackPhoneClick(source: string = 'unknown') {
  trackEvent('click_phone', { source, phone: '+19179939194' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

export function trackApplyClick(source: string = 'unknown') {
  trackEvent('click_apply', { source });
  if (typeof window !== 'undefined') {
    window.fbq?.('trackCustom', 'ApplyClick', { source });
  }
}
