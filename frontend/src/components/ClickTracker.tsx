'use client';

import { useEffect } from 'react';
import { trackPhoneClick, trackApplyClick } from '@/lib/tracking';

/**
 * Client-side delegated click tracker. Fires GA4 + Meta events when:
 *   - Any <a href="tel:..."> link is clicked  → track_phone
 *   - Any <a> or <button> with href pointing to a form anchor
 *     (e.g. /dscr-loans#form) or class "btn-primary" with "Scenario"
 *     or "Apply" text is clicked              → click_apply
 *
 * Uses event delegation so it survives client-side route changes and
 * doesn't require refactoring the server-rendered nav into a client tree.
 */
export default function ClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Walk up to find the nearest anchor or button
      const anchor = target.closest('a, button') as HTMLAnchorElement | HTMLButtonElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href') || '';
      const label = (anchor.textContent || '').trim().toLowerCase();
      const source = detectSource(anchor);

      // Phone click: any tel: link
      if (href.startsWith('tel:')) {
        trackPhoneClick(source);
        return;
      }

      // Apply click: either routes to a form anchor or text implies intent
      const goesToForm = href.includes('#form') || href.endsWith('/apply');
      const textImpliesApply = /submit.*scenario|apply now|get my|submit a deal|get the playbook|scenario/i.test(label);
      if (goesToForm || textImpliesApply) {
        trackApplyClick(source);
      }
    };

    document.addEventListener('click', handler, { passive: true });
    return () => document.removeEventListener('click', handler);
  }, []);

  return null;
}

/**
 * Best-effort detection of WHERE on the page the click fired so analytics
 * can distinguish nav-CTA clicks from footer / hero / inline body CTAs.
 */
function detectSource(el: HTMLElement): string {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    if (node.tagName === 'HEADER') return 'header_nav';
    if (node.tagName === 'FOOTER') return 'footer';
    if (node.tagName === 'NAV') return 'nav';
    if (node.getAttribute('data-section')) return node.getAttribute('data-section') || 'section';
    node = node.parentElement;
  }
  return 'body';
}
