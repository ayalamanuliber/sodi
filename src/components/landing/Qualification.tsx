"use client";

import { BentoCard } from "./BentoCard";

export function Qualification() {
  return (
    <section className="py-20 lg:py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-s-accent/20 bg-s-accent/10 mb-6 md:mb-8 backdrop-blur-md">
              <svg className="w-3.5 h-3.5 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-s-accent uppercase">Para quién es SODI</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 md:mb-8 tg-white leading-[1.1] tracking-tight">
              Esto es para vos si <span className="text-s-sub">ya vendés pero el desorden te frena.</span>
            </h2>

            <p className="text-s-sub text-base md:text-lg mb-8 md:mb-12 leading-relaxed font-light max-w-lg">
              No hacemos "páginas web bonitas" para salir del paso. Construimos la infraestructura digital que tu negocio necesita para crecer sin depender de vos.
            </p>

            <div className="space-y-4 md:space-y-5">
              {[
                "Tenés consultas pero no seguimiento claro",
                "Usás WhatsApp como centro de operación",
                "Tu info está repartida entre chats, Excel y herramientas sueltas",
                "Si te vas 15 días, todo se frena",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 md:gap-5 p-3 md:p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors group"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-s-accent/10 flex items-center justify-center shrink-0 border border-s-accent/20 group-hover:bg-s-accent/20 group-hover:scale-110 transition-all">
                    <svg className="w-4 h-4 text-s-accent" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed pt-0.5 md:pt-1">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Red/Green card */}
          <div className="relative reveal reveal-delay-2 mt-8 lg:mt-0">
            <BentoCard className="p-6 sm:p-8 md:p-12 border-t-4 border-t-white/10">
              <div className="flex flex-col gap-10 md:gap-12">
                {/* Red */}
                <div className="flex gap-4 md:gap-6 pb-10 md:pb-12 border-b border-white/5">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center shrink-0 border border-red-500/20 relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                    <svg className="w-7 h-7 text-red-500 relative z-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                      Probablemente no es para vos si:
                    </h4>
                    <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-s-sub font-medium">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 mt-0.5 font-black text-lg leading-none">×</span>
                        Buscás lo más barato sin importar la calidad.
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 mt-0.5 font-black text-lg leading-none">×</span>
                        Tu negocio es solo una idea y todavía no tenés clientes.
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-red-500 mt-0.5 font-black text-lg leading-none">×</span>
                        No estás dispuesto a invertir en tecnología para crecer.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Green */}
                <div className="flex gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-s-accent/20 to-s-accent/5 flex items-center justify-center shrink-0 border border-s-accent/30 relative">
                    <div className="absolute inset-0 rounded-2xl bg-s-accent opacity-20 blur-xl" />
                    <svg className="w-7 h-7 text-s-accent relative z-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                      Este es tu lugar si:
                    </h4>
                    <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-s-sub font-medium">
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-s-accent mt-0.5 font-black text-lg leading-none">✓</span>
                        Tenés margen para crecer pero tu operatividad te limita.
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-s-accent mt-0.5 font-black text-lg leading-none">✓</span>
                        Entendés que un sistema es una inversión, no un gasto.
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <span className="text-s-accent mt-0.5 font-black text-lg leading-none">✓</span>
                        Querés dejar de depender 100% de vos para que el negocio funcione.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
