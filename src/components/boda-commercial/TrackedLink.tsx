"use client";

import { useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import { guestReferralTrialHref } from "@/lib/boda-referral";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: string;
  eventLocation: string;
};

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

export function TrackedLink({
  children,
  eventName,
  eventLocation,
  onClick,
  ...props
}: TrackedLinkProps) {
  const search = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.search,
    () => "",
  );
  const resolvedHref = (props.href === "/boda/prueba" || props.href === "/boda/empezar")
    ? guestReferralTrialHref(search, props.href)
    : props.href;

  return (
    <a
      {...props}
      href={resolvedHref}
      onClick={(event) => {
        trackEvent(eventName, {
          location: eventLocation,
          page: "/boda",
          vertical: "weddings",
        });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
