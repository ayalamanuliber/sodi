"use client";

import { track as trackVercelEvent } from "@vercel/analytics";

type TrackingValue = string | number | boolean | null | undefined | string[];
type TrackingProperties = Record<string, TrackingValue>;

type MetaMode = "standard" | "custom";

const META_STANDARD_EVENTS = new Set([
  "Contact",
  "Lead",
  "PageView",
  "Purchase",
  "ViewContent",
  "InitiateCheckout",
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function cleanProperties(properties: TrackingProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  ) as Record<string, Exclude<TrackingValue, undefined>>;
}

function toVercelProperties(properties: TrackingProperties = {}) {
  const cleaned = cleanProperties(properties);

  return Object.fromEntries(
    Object.entries(cleaned).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ]),
  ) as Record<string, string | number | boolean | null>;
}

function toMetaEventName(eventName: string) {
  if (eventName === "directory_view") return "ViewContent";
  if (eventName === "checkout_start") return "InitiateCheckout";
  if (eventName === "purchase") return "Purchase";
  if (eventName === "generate_lead") return "Lead";
  if (eventName === "whatsapp_click") return "Contact";
  return eventName;
}

function getMetaMode(metaEventName: string): MetaMode {
  return META_STANDARD_EVENTS.has(metaEventName) ? "standard" : "custom";
}

export function trackEvent(eventName: string, properties: TrackingProperties = {}) {
  if (typeof window === "undefined") return;

  const cleaned = cleanProperties(properties);
  const vercelProperties = toVercelProperties(cleaned);

  try {
    trackVercelEvent(eventName, vercelProperties);
  } catch {
    // Analytics should never block the user flow.
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, cleaned);
  }

  if (typeof window.fbq === "function") {
    const metaEventName = toMetaEventName(eventName);
    const mode = getMetaMode(metaEventName);
    window.fbq(mode === "standard" ? "track" : "trackCustom", metaEventName, cleaned);
  }
}

export function trackMetaEvent(eventName: string, properties?: TrackingProperties) {
  const normalizedEventName =
    eventName === "ViewContent"
      ? "directory_view"
      : eventName === "InitiateCheckout"
        ? "checkout_start"
        : eventName === "Purchase"
          ? "purchase"
          : eventName;

  trackEvent(normalizedEventName, properties);
}
