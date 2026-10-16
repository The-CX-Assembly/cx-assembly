'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { IS_STAGING } from '@/config/env';

/**
 * Google Tag Manager for the public website (thecmoassembly.com uses GTM too).
 * Set NEXT_PUBLIC_GTM_ID to the container id (GTM-XXXXXXX) to turn it on.
 * The private admin console and the staging site are never tracked.
 */
export default function GoogleTagManager({ id }: { id?: string }) {
  const pathname = usePathname();
  if (IS_STAGING || !id || !/^GTM-[A-Z0-9]+$/.test(id) || pathname.startsWith('/admin')) return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
