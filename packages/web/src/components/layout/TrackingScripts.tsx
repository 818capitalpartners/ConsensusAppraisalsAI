'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { captureUTMParams } from '@/lib/utm';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function TrackingScripts() {
  useEffect(() => {
    captureUTMParams();
  }, []);

  return (
    <>
      {/* Google Tag Manager */}
      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}

      {/* GA4 (fallback if no GTM) */}
      {GA4_ID && !GTM_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());gtag('config','${GA4_ID}',{send_page_view:true});`}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {/* TikTok Pixel */}
      {TIKTOK_PIXEL_ID && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
          ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
          o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
          var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${TIKTOK_PIXEL_ID}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}

      {/* Google Ads */}
      {GOOGLE_ADS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}
          </Script>
        </>
      )}

      {/* GTM noscript fallback */}
      {GTM_ID && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}
    </>
  );
}
