import { NextRequest, NextResponse } from "next/server";
import { createDownloadToken, getDeliveryManifest, resolvePlanSlugFromPayment } from "@/lib/directorio/delivery";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";

    if (!paymentId) {
      return NextResponse.json({ error: "Falta paymentId." }, { status: 400 });
    }

    const { planSlug, paymentInfo } = await resolvePlanSlugFromPayment(paymentId);
    const manifest = await getDeliveryManifest();
    const pack = manifest[planSlug];

    if (!pack) {
      return NextResponse.json({ error: "No encontramos el archivo del pack." }, { status: 404 });
    }

    const token = createDownloadToken(paymentId, planSlug);

    return NextResponse.json({
      approved: true,
      paymentStatus: paymentInfo.status,
      planSlug,
      packName: pack.name,
      rowCount: pack.row_count,
      downloadUrl: `/api/directorio/download?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo validar el pago." },
      { status: 400 },
    );
  }
}
