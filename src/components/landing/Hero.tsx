"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center text-center px-5 pt-32 pb-20 md:pb-24 overflow-hidden">
      {/* Light beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] h-[400px] md:h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(0,255,163,0.15)_0%,transparent_60%)] pointer-events-none" />

      {/* Badge */}
      <div className="reveal inline-flex items-center gap-2.5 px-3 md:px-4 py-2 rounded-full border border-s-accent/20 bg-s-accent/5 backdrop-blur-md mb-8 md:mb-10 shadow-[0_4px_20px_rgba(0,255,163,0.05)]">
        <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-s-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-s-accent shadow-[0_0_8px_#00FFA3]" />
        </span>
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-s-accent uppercase">
          Webs, sistemas y automatización
        </span>
      </div>

      {/* Title */}
      <h1 className="reveal reveal-delay-1 font-heading text-[2.5rem] leading-[1.1] sm:text-5xl md:text-7xl lg:text-[7rem] font-extrabold tracking-tighter max-w-5xl mx-auto md:leading-[1.02] mb-6 md:mb-8 relative z-10">
        <span className="tg-white block pb-1 md:pb-2">Menos desorden.</span>
        <span className="tg-accent">Más ventas y control.</span>
      </h1>

      {/* Subtitle */}
      <p className="reveal reveal-delay-2 text-base md:text-xl text-s-sub max-w-3xl mx-auto mb-10 md:mb-14 leading-relaxed font-light">
        Webs, redes, automatizaciones y sistemas para empresas que ya venden, pero necesitan más orden para crecer.{" "}
        <strong className="text-white font-normal border-b border-s-accent/40 pb-0.5">
          Precios fijos, planes claros y todo incluido.
        </strong>
      </p>

      {/* Buttons */}
      <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center gap-4 md:gap-5 w-full sm:w-auto z-20">
        <Link
          href="/diagnostico"
          className="btn-primary w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 text-sm md:text-base lg:text-lg flex items-center justify-center gap-3 group"
        >
          Hacer diagnóstico guiado
          <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <a
          href="#servicios"
          className="btn-secondary w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 text-sm md:text-base lg:text-lg flex items-center justify-center gap-3"
        >
          Ver servicios y precios
        </a>
      </div>

      {/* Trust badges */}
      <div className="reveal reveal-delay-4 mt-8 md:mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-xs md:text-sm text-s-sub font-medium">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sin compromiso
        </div>
        <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Precio fijo al instante
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-[30px] h-[50px] border-2 border-white/20 rounded-full flex justify-center p-2">
          <div className="w-1 h-3 bg-s-accent rounded-full" />
        </div>
      </div>
    </section>
  );
}
