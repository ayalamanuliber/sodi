import { PaymentSuccessClient } from "@/components/directorio/PaymentSuccessClient";
import { paymentStatusMetadata } from "@/lib/directorio/payment-metadata";

export const metadata = paymentStatusMetadata;

export default async function PagoAprobadoPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const params = await searchParams;
  const paymentId = params.payment_id;

  return (
    <main className="min-h-screen bg-[#05060a] px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-s-accent/20 bg-white/[0.03] p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-s-accent/10 text-s-accent">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 font-heading text-4xl font-extrabold">Pago aprobado</h1>
        <p className="mt-4 text-base leading-relaxed text-s-sub sm:text-lg">
          El pago se acreditó correctamente. Ahora te habilitamos la descarga del archivo.
        </p>
        <PaymentSuccessClient paymentId={paymentId} />
      </div>
    </main>
  );
}
