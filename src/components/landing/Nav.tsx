"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-nav py-3 md:py-4" : "bg-transparent py-5 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-12 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="sodi-mark text-xl md:text-2xl">SODI</span>
          </Link>

          {/* Desktop pill nav */}
          <div className="hidden lg:flex items-center gap-8 bg-white/[0.03] px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <button onClick={() => scrollTo("servicios")} className="text-sm font-medium text-s-sub hover:text-white transition-colors">
              Servicios
            </button>
            <button onClick={() => scrollTo("metodo")} className="text-sm font-medium text-s-sub hover:text-white transition-colors">
              Proceso
            </button>
            <button onClick={() => scrollTo("casoreal")} className="text-sm font-medium text-s-sub hover:text-white transition-colors">
              Caso real
            </button>
            <Link href="/blog" className="text-sm font-medium text-s-sub hover:text-white transition-colors">
              Blog
            </Link>
          </div>

          <div className="hidden md:block">
            <Link
              href="/diagnostico"
              className="btn-primary px-7 py-3 text-sm flex items-center gap-2"
            >
              Diagnóstico
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden text-white p-2 relative z-50" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#050508]/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 pt-20 transition-all duration-500 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {[
          { label: "Servicios", id: "servicios" },
          { label: "Proceso", id: "metodo" },
          { label: "Caso real", id: "casoreal" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="text-3xl font-heading font-bold text-white hover:text-s-accent transition-colors"
          >
            {item.label}
          </button>
        ))}
        <Link href="/blog" onClick={() => setMobileOpen(false)} className="text-3xl font-heading font-bold text-white hover:text-s-accent transition-colors">
          Blog
        </Link>
        <Link
          href="/diagnostico"
          className="btn-primary px-8 py-4 mt-8 flex items-center gap-2 text-lg"
          onClick={() => setMobileOpen(false)}
        >
          Diagnóstico
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </>
  );
}
