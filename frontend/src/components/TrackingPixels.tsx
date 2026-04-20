import Script from 'next/script';

/**
 * Central place for retargeting / ad-attribution pixels.
 *
 * Each pixel is gated on its own public env var (NEXT_PUBLIC_*). If the
 * var is empty, the script is simply not rendered — nothing breaks, no
 * noisy warnings, and the existing tracking.ts `fbq?.()` / `ttq?.()`
 * calls throughout the app just no-op.
 *
 * Pixels supported:
 *   - Meta (Facebook) Pixel  — NEXT_PUBLIC_META_PIXEL_ID  (e.g. "1234567890")
 *   - Google Ads Remarketing — NEXT_PUBLIC_GOOGLE_ADS_ID  (e.g. "AW-123456789")
 *   - LinkedIn Insight Tag   — NEXT_PUBLIC_LINKEDIN_PARTNER_ID (e.g. "1234567")
 *   - TikTok Pixel           — NEXT_PUBLIC_TIKTOK_PIXEL_ID (e.g. "C1A2B3...")
 *
 * Add the IDs in Vercel → Project Settings → Environment Variables.
 * They are safe to be public (they always appear in the HTML anyway).
 */
export default function TrackingPixels() {
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const linkedinId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
  const tiktokId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  return (
    <>
      {/* ── Meta (Facebook) Pixel ────────────────────────── */}
      {metaId && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          {/* No-JS fallback pixel */}
          <noscript>
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* ── Google Ads Remarketing Tag ────────────────────── */}
      {googleAdsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-ads-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              `,
            }}
          />
        </>
      )}

      {/* ── LinkedIn Insight Tag ──────────────────────────── */}
      {linkedinId && (
        <>
          <Script
            id="linkedin-insight"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                _linkedin_partner_id = "${linkedinId}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
                (function(l) {
                  if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                  window.lintrk.q=[]}
                  var s = document.getElementsByTagName("script")[0];
                  var b = document.createElement("script");
                  b.type = "text/javascript"; b.async = true;
                  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                  s.parentNode.insertBefore(b, s);
                })(window.lintrk);
              `,
            }}
          />
          <noscript>
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://px.ads.linkedin.com/collect/?pid=${linkedinId}&fmt=gif`}
            />
          </noscript>
        </>
      )}

      {/* ── TikTok Pixel ──────────────────────────────────── */}
      {tiktokId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
                e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${tiktokId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
