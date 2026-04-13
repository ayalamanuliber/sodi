import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-16 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20">
          <div className="sm:col-span-2">
            <div className="mb-6 md:mb-8">
              <span className="sodi-mark text-2xl md:text-3xl">SODI</span>
            </div>
            <p className="text-s-sub text-sm md:text-base max-w-sm leading-relaxed font-light">
              Webs, automatización y sistemas para empresas argentinas que necesitan más orden para crecer.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 md:mb-8 tracking-[0.15em] uppercase text-xs">Servicios</h4>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-500 font-medium">
              <li><a href="#servicios" className="hover:text-s-accent transition-colors">Webs y presencia</a></li>
              <li><a href="#servicios" className="hover:text-s-accent transition-colors">Automatización</a></li>
              <li><a href="#servicios" className="hover:text-s-accent transition-colors">Sistemas internos</a></li>
              <li><Link href="/blog" className="hover:text-s-accent transition-colors">Blog</Link></li>
              <li><Link href="/diagnostico" className="hover:text-s-accent transition-colors">Diagnóstico</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 md:mb-8 tracking-[0.15em] uppercase text-xs">Contacto</h4>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-500 font-medium">
              <li>
                <a href="https://wa.me/5491157210923" target="_blank" rel="noopener noreferrer" className="hover:text-s-accent transition-colors">
                  WhatsApp
                </a>
              </li>
              <li><a href="tel:+541157210923" className="hover:text-white transition-colors">11 5721-0923</a></li>
              <li><a href="mailto:hola@sodi.com.ar" className="hover:text-white transition-colors">hola@sodi.com.ar</a></li>
              <li>Buenos Aires, AR</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 md:pt-10 border-t border-white/10 text-xs md:text-sm text-gray-600 font-medium text-center md:text-left">
          <span>&copy; {new Date().getFullYear()} SODI</span>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
