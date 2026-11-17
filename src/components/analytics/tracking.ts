"use client";

import { isPrivateAnalyticsUrl } from "./privacy-boundary";
import { isProductionAnalyticsHostname } from "./analytics-hosts";

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
    Object.entries(properties).filter(([key, value]) => value !== undefined && !/^(?:email|phone|telefono|nombre|name|code|token|slug|password|notes|notas|integrantes|(?:guest|invite|invitation|payer)_(?:id|name|email|phone|code|token|slug))$/i.test(key)),
  ) as Record<string, Exclude<TrackingValue, undefined>>;
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

type GtagParams = Record<string, Exclude<TrackingValue, undefined>>;

// Events fired on mount (wedding_landing_view, wedding_trial_open, ...) run before the afterInteractive
// gtag script defines window.gtag, so they were silently dropped (0 in GA4 for 28 d; sodi-8887).
// Hold them and flush as soon as gtag exists (50 ms polling, 10 s cap, 50 events max).
const pendingGtagEvents: Array<[string, GtagParams]> = [];
let flushTimer: ReturnType<typeof setInterval> | undefined;

function sendGtagEvent(eventName: string, cleaned: GtagParams) {
  if (typeof window.gtag !== "function") {
    if (pendingGtagEvents.length < 50) pendingGtagEvents.push([eventName, cleaned]);
    if (flushTimer === undefined) {
      let tries = 0;
      flushTimer = setInterval(() => {
        tries += 1;
        if (typeof window.gtag === "function") {
          for (const [name, params] of pendingGtagEvents.splice(0)) sendGtagEvent(name, params);
        }
        if (typeof window.gtag === "function" || tries >= 200) {
          clearInterval(flushTimer);
          flushTimer = undefined;
          pendingGtagEvents.length = 0;
        }
      }, 50);
    }
    return;
  }
  window.gtag("event", eventName, cleaned);
  // GA4 standard ecommerce name next to the existing custom one (Tarea medicion-marcas-6634).
  if (eventName === "checkout_start") {
    window.gtag("event", "begin_checkout", {
      currency: cleaned.currency,
      value: cleaned.value,
      items: [{ item_id: Array.isArray(cleaned.content_ids) ? cleaned.content_ids[0] : undefined, item_name: cleaned.content_name }],
    });
  }
}

export function trackEvent(eventName: string, properties: TrackingProperties = {}) {
  if (typeof window === "undefined") return;
  if (isPrivateAnalyticsUrl(window.location.href) || !isProductionAnalyticsHostname(window.location.hostname)) return;

  const cleaned = cleanProperties(properties);
  sendGtagEvent(eventName, cleaned);

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
