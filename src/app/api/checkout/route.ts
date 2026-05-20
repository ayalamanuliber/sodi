import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getDirectorioPlanByName } from "@/lib/directorio/plans";
import { getSiteUrl } from "@/lib/site-url";

type CheckoutBody = {
  buyerName?: string;
  buyerEmail?: string;
  planName?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Falta configurar Mercado Pago en el servidor." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as CheckoutBody;
  const buyerName = body.buyerName?.trim();
  const buyerEmail = body.buyerEmail?.trim().toLowerCase();
  const planName = body.planName?.trim();

  if (!buyerName || !buyerEmail || !planName) {
    return NextResponse.json(
      { error: "Faltan datos para iniciar el pago." },
      { status: 400 },
    );
  }

  if (!isValidEmail(buyerEmail)) {
    return NextResponse.json(
      { error: "El email no parece válido." },
      { status: 400 },
    );
  }

  const plan = getDirectorioPlanByName(planName);

  if (!plan) {
    return NextResponse.json(
      { error: "La opción elegida no existe." },
      { status: 400 },
    );
  }

  const siteUrl = getSiteUrl();
  const externalReference = `dca-${plan.slug}-${randomUUID()}`;
  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: plan.slug,
            title: plan.name,
            description: `Directorio Comercial Argentino - ${plan.records} registros`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: plan.price,
          },
        ],
        payer: {
          name: buyerName,
          email: buyerEmail,
        },
        back_urls: {
          success: `${siteUrl}/directorio-comercial-argentino/pago-aprobado`,
          pending: `${siteUrl}/directorio-comercial-argentino/pago-pendiente`,
          failure: `${siteUrl}/directorio-comercial-argentino/pago-error`,
        },
        auto_return: "approved",
        external_reference: externalReference,
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        statement_descriptor: "SODI DATA",
        metadata: {
          product: "directorio-comercial-argentino",
          plan_slug: plan.slug,
          plan_name: plan.name,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
        },
      },
    });

    if (!result.init_point) {
      return NextResponse.json(
        { error: "Mercado Pago no devolvió una URL de pago." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point ?? null,
      externalReference,
    });
  } catch (error) {
    console.error("Mercado Pago checkout error", error);

    return NextResponse.json(
      { error: "No se pudo iniciar el checkout de Mercado Pago." },
      { status: 500 },
    );
  }
}
