import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { directorioPlans } from "@/lib/directorio/plans";

const DELIVERY_ROOT = path.join(process.cwd(), "private", "directorio");
const MANIFEST_PATH = path.join(DELIVERY_ROOT, "manifest.json");

type DeliveryManifestItem = {
  name: string;
  row_count: number;
  price_ars: number;
  zip_path: string;
  csv_path: string;
  xlsx_path: string;
  zip_size_bytes: number;
  public_path?: string;
};

type DeliveryManifest = Record<string, DeliveryManifestItem>;

type SignedDownloadPayload = {
  paymentId: string;
  planSlug: string;
  exp: number;
};

function getSigningSecret() {
  return process.env.DOWNLOAD_TOKEN_SECRET || process.env.MERCADOPAGO_ACCESS_TOKEN || "";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function signValue(value: string) {
  return createHmac("sha256", getSigningSecret()).update(value).digest("base64url");
}

export async function getDeliveryManifest(): Promise<DeliveryManifest> {
  const raw = await readFile(MANIFEST_PATH, "utf-8");
  return JSON.parse(raw) as DeliveryManifest;
}

export async function resolvePlanSlugFromPayment(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Falta configurar Mercado Pago.");
  }

  const client = new MercadoPagoConfig({ accessToken });
  const payment = new Payment(client);
  const paymentInfo = await payment.get({ id: paymentId });

  if (paymentInfo.status !== "approved") {
    throw new Error("El pago todavía no figura aprobado.");
  }

  const metadataSlug = typeof paymentInfo.metadata?.plan_slug === "string" ? paymentInfo.metadata.plan_slug : null;
  if (metadataSlug) {
    return {
      planSlug: metadataSlug,
      paymentInfo,
    };
  }

  const itemId = typeof paymentInfo.additional_info?.items?.[0]?.id === "string"
    ? paymentInfo.additional_info.items[0].id
    : null;

  if (itemId && directorioPlans.some((plan) => plan.slug === itemId)) {
    return {
      planSlug: itemId,
      paymentInfo,
    };
  }

  throw new Error("No se pudo identificar el pack comprado.");
}

export function createDownloadToken(paymentId: string, planSlug: string, ttlSeconds = 60 * 60) {
  const payload: SignedDownloadPayload = {
    paymentId,
    planSlug,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyDownloadToken(token: string): SignedDownloadPayload {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    throw new Error("Token inválido.");
  }

  const expectedSignature = signValue(encodedPayload);
  const valid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!valid) {
    throw new Error("Firma inválida.");
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as SignedDownloadPayload;

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("El enlace de descarga venció.");
  }

  return payload;
}
