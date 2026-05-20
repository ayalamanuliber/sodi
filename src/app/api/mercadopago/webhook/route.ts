import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const searchParams = request.nextUrl.searchParams;
  const body = await request.json().catch(() => null);

  const type = searchParams.get("type") ?? body?.type ?? body?.action ?? null;
  const paymentId =
    searchParams.get("data.id") ??
    body?.data?.id?.toString() ??
    body?.resource?.split("/").pop() ??
    null;

  if (!accessToken || type !== "payment" || !paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    console.info("Mercado Pago webhook payment", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      external_reference: paymentInfo.external_reference,
      payer_email: paymentInfo.payer?.email,
      metadata: paymentInfo.metadata,
    });

    // Proximo paso: persistir la orden y disparar el email con el link de descarga.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mercado Pago webhook error", error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
