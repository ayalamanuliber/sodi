import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/blog-data";
import { silos } from "@/lib/blog-types";

export const runtime = "nodejs";
export const alt = "Guía de SODI para tomar una decisión digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  const silo = silos[slug] ?? (article ? silos[article.silo] : undefined);
  const title = article?.title ?? silo?.label ?? "Guías SODI";
  const context = article ? silo?.label : "Decisiones digitales para empresas";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#050506",
        color: "#f5f5f7",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.18em" }}>SODI</div>
        <div style={{ color: "#00d98b", fontSize: 22 }}>{context}</div>
      </div>
      <div style={{ display: "flex", maxWidth: 1000, fontSize: 62, fontWeight: 760, letterSpacing: "-0.045em", lineHeight: 1.02 }}>
        {title.replaceAll("—", "-").replaceAll("–", "-")}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#a3a3ad", fontSize: 22 }}>
        <span style={{ color: "#00d98b" }}>sodi.com.ar</span>
        <span>Entender el proceso antes de elegir tecnología.</span>
      </div>
    </div>,
    size,
  );
}
