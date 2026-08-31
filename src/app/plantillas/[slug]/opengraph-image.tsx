import { ImageResponse } from "next/og";
import { getTemplateResource } from "@/lib/template-data";

export const runtime = "nodejs";
export const alt = "Plantilla práctica de SODI para ordenar una decisión digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getTemplateResource(slug);
  const title = resource?.title ?? "Plantillas SODI";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#08090a",
        color: "#f4f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.18em" }}>SODI</div>
        <div style={{ color: "#00d98b", fontSize: 22 }}>Herramienta operativa</div>
      </div>
      <div style={{ display: "flex", maxWidth: 1000, fontSize: 62, fontWeight: 760, letterSpacing: "-0.045em", lineHeight: 1.02 }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#a3a3ad", fontSize: 22 }}>
        <span style={{ color: "#00d98b" }}>sodi.com.ar</span>
        <span>Ordenar el caso antes de elegir tecnología.</span>
      </div>
    </div>,
    size,
  );
}

