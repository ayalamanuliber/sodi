import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Qualification } from "@/components/landing/Qualification";
import { Solutions } from "@/components/landing/Solutions";
import { Process } from "@/components/landing/Process";
import { CaseStudy } from "@/components/landing/CaseStudy";
import { Hire } from "@/components/landing/Hire";
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
      <Qualification />
      <Solutions />
      <Process />
      <CaseStudy />
      <Hire />
      <DiagnosticPromo />
      <FinalCTA />
      <Footer />
    </>
  );
}
