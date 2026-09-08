"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import { isGuestWeddingReferral } from "@/lib/boda-referral";

export function WeddingAnalytics() {
  const referralEntryTracked = useRef(false);

  useEffect(() => {
    trackEvent("wedding_landing_view", { page: "/boda", vertical: "weddings" });
    if (!referralEntryTracked.current && isGuestWeddingReferral(window.location.search)) {
      referralEntryTracked.current = true;
      trackEvent("guest_referral_entry", { source: "guest_attribution" });
    }
  }, []);
  return null;
}
