import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 sm:py-16 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 sm:gap-16">
        <div className="max-w-sm">
          <div className="mb-4">
            <span className="sodi-mark">SODI</span>
          </div>
          <p className="text-s-sub text-[13px] leading-relaxed mb-2">
            Webs, automatización y sistemas para empresas que necesitan más control y mejor distribución.
          </p>
          <p className="text-s-dim text-[11px]">Argentina y otros mercados.</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:gap-16">
          <div>
            <h5 className="text-white font-bold text-[11px] uppercase tracking-[0.15em] mb-4">Soluciones</h5>
            <ul className="space-y-2.5 text-s-dim text-[12px]">
              <li><a href="#soluciones" className="hover:text-white transition-colors">Consultas</a></li>
              <li><a href="#soluciones" className="hover:text-white transition-colors">Operación</a></li>
              <li><a href="#soluciones" className="hover:text-white transition-colors">Web</a></li>
              <li><a href="#casoreal" className="hover:text-white transition-colors">Caso real</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold text-[11px] uppercase tracking-[0.15em] mb-4">Contacto</h5>
            <ul className="space-y-2.5 text-s-dim text-[12px]">
              <li><a href="https://wa.me/5491157210923" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
              <li><a href="tel:+541157210923" className="hover:text-white transition-colors">11 5721-0923</a></li>
              <li><a href="mailto:hola@sodi.ar" className="hover:text-white transition-colors">hola@sodi.ar</a></li>
              <li>Buenos Aires, AR</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 sm:mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between text-[11px] text-s-dim gap-3">
        <span>&copy; 2026 SODI</span>
        <div className="flex gap-5">
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Términos</a>
        </div>
      </div>
    </footer>
  );
}
