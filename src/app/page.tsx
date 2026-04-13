import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ProofStrip } from "@/components/landing/ProofStrip";
import { Qualification } from "@/components/landing/Qualification";
import { Servicios } from "@/components/landing/Servicios";
import { Process } from "@/components/landing/Process";
import { CaseStudy } from "@/components/landing/CaseStudy";
import { DiagnosticPromo } from "@/components/landing/DiagnosticPromo";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { InteractiveCanvas } from "@/components/landing/InteractiveCanvas";
import { ScrollRevealInit } from "@/components/landing/ScrollReveal";

export default function Home() {
  return (
    <>
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-40" />
      <InteractiveCanvas />
      <div className="fixed top-[-20%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-s-accent rounded-full blur-[150px] md:blur-[200px] opacity-[0.04] pointer-events-none z-0 mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-s-orange rounded-full blur-[150px] md:blur-[200px] opacity-[0.03] pointer-events-none z-0 mix-blend-screen" />

      <ScrollRevealInit />
      <Nav />

      <main className="relative z-10">
        <Hero />
        <ProofStrip />
        <Qualification />
        <Servicios />
        <Process />
        <CaseStudy />
        <DiagnosticPromo />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
