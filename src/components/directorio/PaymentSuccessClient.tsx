"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; packName: string; rowCount: number; downloadUrl: string };

export function PaymentSuccessClient({ paymentId }: { paymentId?: string }) {
  const purchaseTracked = useRef(false);
  const [state, setState] = useState<State>(
    paymentId ? { status: "loading" } : { status: "error", message: "No encontramos el identificador del pago." },
  );

  useEffect(() => {
    if (!paymentId) return;

    const run = async () => {
      try {
        const response = await fetch("/api/directorio/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });

        const data = await response.json();

        if (!response.ok || !data.downloadUrl) {
          throw new Error(data.error || "No pudimos validar el pago.");
        }

        setState({
          status: "ready",
          packName: data.packName,
          rowCount: data.rowCount,
          downloadUrl: data.downloadUrl,
        });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "No pudimos validar el pago.",
        });
      }
    };

    void run();
  }, [paymentId]);

  useEffect(() => {
    if (state.status !== "ready" || purchaseTracked.current) return;

    purchaseTracked.current = true;
    trackMetaEvent("Purchase", {
      content_name: state.packName,
      content_ids: [state.packName.toLowerCase().replace(/\s+/g, "-")],
      content_type: "product",
      currency: "ARS",
      value:
        state.packName === "Pack Inicial"
          ? 19900
          : state.packName === "Pack PRO"
            ? 34900
            : 49900,
      num_items: 1,
    });
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="mt-8">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-s-accent" />
        <p className="mt-6 text-base text-s-sub">Estamos validando tu pago y preparando la descarga...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-8">
        <p className="text-base text-red-300">{state.message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/directorio" className="btn-primary px-6 py-4 text-sm font-black">
            Volver al sitio
          </Link>
          <a href="https://wa.me/5491138696958?text=Hola,%20pague%20la%20base%20y%20necesito%20ayuda%20con%20la%20descarga." className="btn-secondary px-6 py-4 text-sm font-bold">
            Pedir ayuda por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-base text-white">
        Tu compra quedó aprobada. Ya podés descargar <span className="font-bold text-s-accent">{state.packName}</span> con {state.rowCount.toLocaleString("es-AR")} registros.
      </p>
      <p className="mt-3 text-sm text-s-sub">
        Guardá el archivo apenas se descargue. Si algo falla, escribinos y te ayudamos.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={state.downloadUrl} className="btn-primary px-6 py-4 text-sm font-black">
          Descargar archivo
        </a>
        <Link href="/directorio" className="btn-secondary px-6 py-4 text-sm font-bold">
          Volver al directorio
        </Link>
      </div>
    </div>
  );
}
