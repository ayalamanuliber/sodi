import { NextRequest, NextResponse } from "next/server";
import { getDeliveryManifest, verifyDownloadToken } from "@/lib/directorio/delivery";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    const payload = verifyDownloadToken(token);
    const manifest = await getDeliveryManifest();
    const pack = manifest[payload.planSlug];

    if (!pack) {
      return new NextResponse("Pack no encontrado.", { status: 404 });
    }

    if (!pack.public_path) {
      return new NextResponse("No encontramos la entrega pública del pack.", { status: 500 });
    }

    const target = new URL(pack.public_path, request.nextUrl.origin);
    return NextResponse.redirect(target, { status: 302 });
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : "No se pudo descargar el archivo.",
      { status: 400 },
    );
  }
}
