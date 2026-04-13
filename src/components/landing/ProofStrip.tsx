"use client";

const stack = [
  { icon: "⚡", label: "Next.js" },
  { icon: "⚛️", label: "React" },
  { icon: "🟦", label: "TypeScript" },
  { icon: "🐍", label: "Python" },
  { icon: "💬", label: "WhatsApp API" },
  { icon: "🔗", label: "Make / Zapier" },
  { icon: "🎨", label: "Tailwind CSS" },
  { icon: "▲", label: "Vercel" },
  { icon: "🗄️", label: "PostgreSQL" },
  { icon: "🤖", label: "Claude / GPT" },
];

export function ProofStrip() {
  return (
    <section className="py-8 md:py-10 border-y border-white/5 bg-[#050508]/80 backdrop-blur-xl overflow-hidden relative z-20">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-20 md:w-40 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-20 md:w-40 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 text-center mb-4 md:mb-6 relative z-20">
        <p className="text-[10px] md:text-xs text-s-sub font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
          Construido con tecnología de punta
        </p>
      </div>

      <div className="marquee-track flex gap-12 md:gap-20 items-center opacity-60 hover:opacity-100 transition-opacity duration-700">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex gap-12 md:gap-20 items-center shrink-0">
            {stack.map((item) => (
              <div key={`${idx}-${item.label}`} className="flex items-center gap-2.5 md:gap-3 shrink-0">
                <span className="text-lg md:text-xl">{item.icon}</span>
                <span className="font-heading font-bold text-base md:text-lg text-white whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
