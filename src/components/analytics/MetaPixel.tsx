"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPrivateAnalyticsUrl } from "./privacy-boundary";
export { trackMetaEvent } from "./tracking";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2273367219772687";

export function MetaPixel() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === previousPathname.current) return;
    previousPathname.current = pathname;
    if (isPrivateAnalyticsUrl(window.location.href)) return;
    if (typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [pathname]);

  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
    </Script>
  );
}
