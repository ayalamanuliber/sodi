export const GUEST_REFERRAL_PARAMS = {
  utm_source: "invitacion",
  utm_medium: "guest_attribution",
  utm_campaign: "sodi_bodas",
} as const;

export function isGuestWeddingReferral(search: string | URLSearchParams) {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return params.get("utm_source") === GUEST_REFERRAL_PARAMS.utm_source
    && params.get("utm_medium") === GUEST_REFERRAL_PARAMS.utm_medium
    && params.get("utm_campaign") === GUEST_REFERRAL_PARAMS.utm_campaign;
}

export function guestReferralTrialHref(search: string | URLSearchParams, destination = "/boda/prueba") {
  if (!isGuestWeddingReferral(search)) return destination;
  return `${destination}?${new URLSearchParams(GUEST_REFERRAL_PARAMS).toString()}`;
}
