import Link from "next/link";

export default function PagoPendientePage() {
  return (
    <main className="min-h-screen bg-[#05060a] px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <h1 className="font-heading text-4xl font-extrabold">Pago pendiente</h1>
        <p className="mt-4 text-base leading-relaxed text-s-sub sm:text-lg">
          Mercado Pago todavía no confirmó el pago. Cuando quede aprobado, ya está todo listo para seguir con la automatización.
        </p>
        <div className="mt-8">
          <Link href="/directorio-comercial-argentino" className="btn-primary px-6 py-4 text-sm font-black">
            Volver a intentar
          </Link>
        </div>
      </div>
    </main>
  );
}
