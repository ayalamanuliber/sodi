import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
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

    const zipPath = path.normalize(pack.zip_path);
    const fileStats = await stat(zipPath);
    const stream = createReadStream(zipPath);

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": fileStats.size.toString(),
        "Content-Disposition": `attachment; filename="${payload.planSlug}.zip"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : "No se pudo descargar el archivo.",
      { status: 400 },
    );
  }
}
