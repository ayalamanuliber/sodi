"use client";

const steps = [
  {
    step: "Fase 1",
    title: "Diagnóstico",
    desc: "Mapeamos tu negocio completo. Detectamos dónde perdés tiempo, control o ventas y diseñamos el plan técnico.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "Fase 2",
    title: "Implementación",
    desc: "Construimos tu web, armamos las automatizaciones y conectamos todo. Sin interrumpir tu operación de todos los días.",
    icon: (
      <svg className="w-7 h-7 text-s-accent drop-shadow-[0_0_15px_rgba(0,255,163,0.6)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    active: true,
  },
  {
    step: "Fase 3",
    title: "Optimización",
    desc: "Lanzamos, capacitamos a tu equipo y medimos datos reales para aplicar mejoras continuas.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Process() {
  return (
    <section id="metodo" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-16 md:mb-24 text-center tg-white tracking-tight reveal leading-[1.1]">
          Cómo trabajamos
        </h2>

        <div className="relative max-w-6xl mx-auto">
          {/* Static connector — desktop */}
          <div className="hidden md:block absolute top-[60px] left-[15%] w-[70%] h-[2px] bg-gradient-to-r from-white/5 via-s-accent/30 to-white/5 z-0" />

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((item, i) => (
              <div key={i} className={`reveal relative flex flex-col items-center text-center group`} style={{ transitionDelay: `${(i + 1) * 150}ms` }}>
                <div
                  className={`w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-[24px] md:rounded-[32px] bg-[#050508] flex items-center justify-center mb-8 md:mb-10 relative z-10 transition-all duration-500 shadow-2xl ${
                    item.active
                      ? "border-2 border-s-accent shadow-[0_0_40px_rgba(0,255,163,0.25)] scale-110 bg-gradient-to-b from-s-accent/10 to-transparent"
                      : "border border-white/10 group-hover:border-white/30 group-hover:-translate-y-2"
                  }`}
                >
                  {item.icon}
                  <div
                    className={`absolute -bottom-3 md:-bottom-4 px-4 md:px-5 py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-xl border ${
                      item.active
                        ? "bg-s-accent text-black border-s-accent shadow-[0_4px_20px_rgba(0,255,163,0.4)]"
                        : "bg-[#111] text-white border-white/20"
                    }`}
                  >
                    {item.step}
                  </div>
                </div>

                <h3 className="font-heading text-xl md:text-2xl font-bold mb-4 md:mb-5 text-white">
                  {item.title}
                </h3>
                <p className="text-s-sub text-sm md:text-base leading-relaxed font-light px-2 md:px-4">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
