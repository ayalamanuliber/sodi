import Link from "next/link";

export default function PagoAprobadoPage() {
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
          El cobro quedó confirmado. El siguiente paso es terminar la entrega automática del archivo para que llegue sola después del pago.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/directorio-comercial-argentino" className="btn-primary px-6 py-4 text-sm font-black">
            Volver a la landing
          </Link>
          <a href="https://wa.me/5491157210923?text=Hola,%20ya%20pague%20la%20base%20y%20quiero%20confirmar%20la%20entrega." className="btn-secondary px-6 py-4 text-sm font-bold">
            Confirmar por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
