import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-5">
      <div className="max-w-6xl mx-auto flex justify-between items-center glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 border-white/5 shadow-2xl">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="sodi-mark">SODI</span>
          <span className="hidden sm:inline-block h-3 w-px bg-white/10 self-center" />
          <span className="hidden sm:block text-[10px] text-s-dim tracking-[0.12em] uppercase font-heading font-medium">
            soluciones digitales
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-s-sub uppercase tracking-wider">
          <a href="#soluciones" className="hover:text-white transition-colors">Soluciones</a>
          <a href="#metodo" className="hover:text-white transition-colors">Proceso</a>
          <a href="#casoreal" className="hover:text-white transition-colors">Caso real</a>
        </div>
        <Link
          href="/diagnostico"
          className="bg-white text-black px-4 sm:px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-tight hover:bg-s-accent transition-all"
        >
          Diagnóstico
        </Link>
      </div>
    </nav>
  );
}
