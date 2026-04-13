"use client";

import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-28 md:py-40 lg:py-52 relative overflow-hidden bg-black border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,163,0.08)_0%,transparent_60%)]" />

      <div className="max-w-5xl mx-auto px-5 md:px-6 text-center relative z-10 reveal">
        <h2 className="font-heading text-[2.5rem] leading-[1.05] sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black mb-8 md:mb-12 text-white tracking-tighter md:leading-[1]">
          Te mostramos dónde estás perdiendo ventas, tiempo o control.
        </h2>

        <p className="text-base md:text-xl lg:text-2xl text-s-sub mb-12 md:mb-16 max-w-3xl mx-auto font-light leading-relaxed">
          Hacé el diagnóstico guiado o escribinos directo por WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5">
          <Link
            href="/diagnostico"
            className="btn-primary w-full sm:w-auto px-8 md:px-12 lg:px-16 py-5 md:py-6 lg:py-7 rounded-full text-base md:text-lg lg:text-xl flex items-center justify-center gap-3 md:gap-4 shadow-[0_10px_40px_rgba(0,255,163,0.2)] md:shadow-[0_10px_50px_rgba(0,255,163,0.3)]"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Hacer diagnóstico guiado
          </Link>
          <a
            href="https://wa.me/5491157210923"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 rounded-full text-base md:text-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 text-s-wa" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.892.527 3.66 1.438 5.163L2 22l4.97-1.392A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            WhatsApp
          </a>
        </div>

        <p className="mt-6 md:mt-8 text-s-dim text-[11px] md:text-sm">
          <a href="tel:+541157210923" className="hover:text-white transition-colors">11 5721-0923</a> · hola@sodi.com.ar
        </p>
      </div>
    </section>
  );
}
