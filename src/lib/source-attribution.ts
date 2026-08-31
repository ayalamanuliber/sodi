export type SourceClass = "portfolio" | "editorial" | "campaign" | "referral" | "direct";

export interface SourceAttribution {
  sourceClass: SourceClass;
  source: string;
  medium: string;
  campaign?: string;
  asset?: string;
  referrerHost?: string;
}

const MAX_VALUE_LENGTH = 120;

function clean(value: string | null) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_VALUE_LENGTH);
  return normalized || undefined;
}

function getReferrerHost(referrer?: string) {
  if (!referrer) return undefined;

  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return undefined;
  }
}

export function classifySourceAttribution(
  params: URLSearchParams,
  referrer?: string,
  currentHost = "sodi.com.ar",
): SourceAttribution {
  const explicitRef = clean(params.get("ref"));
  const utmSource = clean(params.get("utm_source"));
  const utmMedium = clean(params.get("utm_medium"));
  const utmCampaign = clean(params.get("utm_campaign"));
  const origin = clean(params.get("origen"));
  const asset = clean(params.get("articulo")) ?? clean(params.get("recurso"));
  const referrerHost = getReferrerHost(referrer);
  const normalizedCurrentHost = currentHost.replace(/^www\./, "").toLowerCase();

  if (explicitRef?.toLowerCase() === "caede" || utmSource?.toLowerCase() === "caede") {
    return {
      sourceClass: "portfolio",
      source: "caede",
      medium: utmMedium ?? "referral",
      campaign: utmCampaign,
      asset,
      referrerHost,
    };
  }

  if (origin && ["blog", "plantilla", "plantillas"].includes(origin.toLowerCase())) {
    return {
      sourceClass: "editorial",
      source: origin.toLowerCase(),
      medium: "internal",
      asset,
      referrerHost,
    };
  }

  if (utmSource) {
    return {
      sourceClass: "campaign",
      source: utmSource.toLowerCase(),
      medium: utmMedium ?? "unknown",
      campaign: utmCampaign,
      asset,
      referrerHost,
    };
  }

  if (referrerHost && referrerHost !== normalizedCurrentHost) {
    return {
      sourceClass: "referral",
      source: referrerHost,
      medium: "referral",
      asset,
      referrerHost,
    };
  }

  return {
    sourceClass: "direct",
    source: "direct",
    medium: "none",
    asset,
  };
}

export function formatAttributionForMessage(attribution?: SourceAttribution) {
  if (
    !attribution ||
    !["portfolio", "editorial"].includes(attribution.sourceClass)
  ) return undefined;

  const asset = attribution.asset ? ` / ${attribution.asset}` : "";
  return `${attribution.sourceClass}: ${attribution.source}${asset}`;
}
