"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { MetaPixel } from "./MetaPixel";
import { isProductionAnalyticsHostname } from "./analytics-hosts";
import { isPrivateAnalyticsUrl, installAnalyticsNavigationBoundary } from "./privacy-boundary";

let boundaryInstalled = false;
function subscribeToHost(notify: () => void) {
  if (!boundaryInstalled) {
    installAnalyticsNavigationBoundary(window);
    boundaryInstalled = true;
    notify();
  }
  return () => undefined;
}

function isProductionHost() {
  return boundaryInstalled && isProductionAnalyticsHostname(window.location.hostname) && !isPrivateAnalyticsUrl(window.location.href);
}

function isServer() {
  return false;
}

/**
 * Keeps every remote analytics loader out of local and preview environments.
 * The server snapshot is deliberately false, so tracker markup never leaks into
 * localhost HTML before the browser hostname has been verified.
 */
export function ProductionAnalytics() {
  const enabled = useSyncExternalStore(
    subscribeToHost,
    isProductionHost,
    isServer,
  );

  if (!enabled) return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BXSWHC7WLX"
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BXSWHC7WLX');`}
      </Script>
      <MetaPixel />
      <Analytics />
    </>
  );
}
