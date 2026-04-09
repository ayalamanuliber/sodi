"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { allServices, formatPrice, type ServiceLine } from "@/lib/diagnostico";

const tierLabels = ["Starter", "Profesional", "Premium"];

const tabs: { slug: string; short: string }[] = [
  { slug: "presencia-online", short: "Web" },
  { slug: "redes-sociales", short: "Redes" },
  { slug: "pack-digital", short: "Pack Digital" },
  { slug: "automatizacion", short: "Automatización" },
  { slug: "sistemas-internos", short: "Sistemas" },
  { slug: "solucion-integral", short: "Integral" },
];

function Check() {
  return (
    <svg className="w-3.5 h-3.5 text-s-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PriceCard({
  tier,
  index,
  isCaede,
  isPopular,
}: {
  tier: { name: string; price: number; caede: number; features: string[] };
  index: number;
  isCaede: boolean;
  isPopular: boolean;
}) {
  const price = isCaede ? tier.caede : tier.price;

  return (
    <div
      className={`relative flex flex-col p-5 sm:p-7 rounded-2xl border transition-all duration-300 ${
        isPopular
          ? "bg-s-accent/[0.04] border-s-accent/20 shadow-[0_0_40px_rgba(0,255,163,0.06)]"
          : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-s-accent text-black text-[10px] font-black uppercase tracking-wider rounded-full">
          Popular
        </span>
      )}

      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-s-dim mb-2">
        {tier.name}
      </p>

      <div className="mb-1">
        <span className="text-[2rem] sm:text-[2.4rem] font-extrabold font-heading tracking-tighter text-white">
          ${formatPrice(price)}
        </span>
      </div>

      {isCaede && (
        <p className="text-[11px] text-s-accent font-semibold mb-4">
          <span className="line-through text-s-dim font-normal mr-1.5">${formatPrice(tier.price)}</span>
          CAEDE -25%
        </p>
      )}
      {!isCaede && <div className="mb-4" />}

      <ul className="space-y-2.5 flex-1">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[12px] sm:text-[13px] text-white/70 leading-snug">
            <Check />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/diagnostico"
        className={`mt-6 w-full py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-tight text-center transition-all ${
          isPopular
            ? "bg-s-accent text-black hover:brightness-110"
            : "bg-white/[0.06] text-white border border-white/10 hover:bg-white/10"
        }`}
      >
        Empezar
      </Link>
    </div>
  );
}

export function Servicios() {
  const [activeSlug, setActiveSlug] = useState("presencia-online");
  const [isCaede, setIsCaede] = useState(false);

  const active = allServices.find((s) => s.slug === activeSlug)!;

  return (
    <section id="servicios" className="py-14 sm:py-24 px-4 sm:px-6 bg-[#050508]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div {...fadeUp()} className="mb-8 sm:mb-12">
          <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-3">
            Servicios y precios
          </p>
          <h2 className="text-[1.4rem] sm:text-3xl md:text-[2.75rem] font-extrabold tracking-tighter leading-tight max-w-2xl font-heading">
            Precios fijos. Sin sorpresas.
          </h2>
          <p className="text-s-dim text-[13px] sm:text-[14px] mt-3 max-w-lg leading-relaxed">
            Elegí el servicio que necesitás. Cada plan incluye todo lo listado, sin costos ocultos.
          </p>
        </motion.div>

        {/* CAEDE toggle */}
        <motion.div {...fadeUp(0.05)} className="mb-6 sm:mb-8">
          <button
            onClick={() => setIsCaede(!isCaede)}
            className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border text-[12px] font-semibold transition-all ${
              isCaede
                ? "bg-s-accent/[0.08] border-s-accent/25 text-s-accent"
                : "bg-white/[0.03] border-white/[0.08] text-s-sub hover:border-white/15"
            }`}
          >
            <span
              className={`relative w-9 h-5 rounded-full transition-colors ${
                isCaede ? "bg-s-accent/30" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  isCaede ? "left-[18px] bg-s-accent" : "left-0.5 bg-white/40"
                }`}
              />
            </span>
            Soy miembro CAEDE
            {isCaede && (
              <span className="text-[10px] font-bold bg-s-accent/15 px-2 py-0.5 rounded">
                -25%
              </span>
            )}
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          {...fadeUp(0.1)}
          className="flex gap-1.5 sm:gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveSlug(tab.slug)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold uppercase tracking-wide transition-all shrink-0 ${
                activeSlug === tab.slug
                  ? "bg-white/10 text-white border border-white/15"
                  : "bg-white/[0.02] text-s-sub border border-white/[0.05] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {tab.short}
            </button>
          ))}
        </motion.div>

        {/* Service description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 sm:mb-8">
              <h3 className="text-[1.1rem] sm:text-xl font-bold tracking-tight text-white mb-1.5">
                {active.title}
              </h3>
              <p className="text-s-sub text-[13px] leading-relaxed max-w-2xl">
                {active.description}
              </p>
              <p className="text-s-dim text-[11px] mt-2">
                Plazo estimado: {active.timeline}
              </p>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {active.tiers.map((tier, i) => (
                <PriceCard
                  key={`${activeSlug}-${i}`}
                  tier={tier}
                  index={i}
                  isCaede={isCaede}
                  isPopular={i === 1}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CAEDE promo (when not toggled) */}
        {!isCaede && (
          <motion.div {...fadeUp(0.2)} className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-[13px] sm:text-[14px] text-s-sub">
              <span className="text-s-accent font-bold">Miembros CAEDE</span> obtienen{" "}
              <span className="text-white font-semibold">25% de descuento</span> en todos los servicios.{" "}
              <a
                href="https://caede.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-s-accent underline underline-offset-2 hover:text-white transition-colors"
              >
                Conocé CAEDE
              </a>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
