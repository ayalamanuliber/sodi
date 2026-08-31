"use client";

import Link from "next/link";
import { trackEvent } from "@/components/analytics/tracking";

export function TemplateDiagnosticLink({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  return (
    <Link
      href={`/diagnostico?origen=plantilla&recurso=${encodeURIComponent(slug)}`}
      onClick={() =>
        trackEvent("content_tool_handoff", {
          source_asset: `/plantillas/${slug}`,
          source_cluster: "plantillas",
          destination: "diagnostico",
          contact_state: "not_started",
        })
      }
    >
      {label}
    </Link>
  );
}
