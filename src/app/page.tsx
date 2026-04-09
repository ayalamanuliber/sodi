import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ProofStrip } from "@/components/landing/ProofStrip";
import { Qualification } from "@/components/landing/Qualification";
import { Servicios } from "@/components/landing/Servicios";
import { CaedeBanner } from "@/components/landing/CaedeBanner";
import { Process } from "@/components/landing/Process";
import { CaseStudy } from "@/components/landing/CaseStudy";
import { DiagnosticPromo } from "@/components/landing/DiagnosticPromo";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Ambient } from "@/components/landing/Ambient";

export default function Home() {
  return (
    <>
      <Ambient />
      <Nav />
      <Hero />
      <ProofStrip />
      <Qualification />
      <Servicios />
      <CaedeBanner />
      <Process />
      <CaseStudy />
      <DiagnosticPromo />
      <FinalCTA />
      <Footer />
    </>
  );
}
