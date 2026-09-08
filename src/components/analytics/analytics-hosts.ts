export const PRODUCTION_ANALYTICS_HOSTS = new Set([
  "sodi.com.ar",
  "www.sodi.com.ar",
]);

export function isProductionAnalyticsHostname(hostname: string) {
  return PRODUCTION_ANALYTICS_HOSTS.has(hostname);
}
