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
