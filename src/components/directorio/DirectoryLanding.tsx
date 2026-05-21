"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";

type Plan = {
  name: string;
  displayName: string;
  tag: string;
  records: string;
  oldPrice: number;
  price: number;
  description: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Pack Inicial",
    displayName: "Inicial",
    tag: "Entrada",
    records: "5.000",
    oldPrice: 39800,
    price: 19900,
    description: "Para empezar con una base chica y salir a probar oferta, mensaje y rubros.",
    cta: "Comprar Inicial",
    features: [
      "5.000 registros seleccionados",
      "Rubros y provincias listas para filtrar",
      "Mail o telefono por registro",
      "Formato Excel / CSV",
    ],
  },
  {
    name: "Pack PRO",
    displayName: "Pro",
    tag: "Mas elegido",
    records: "12.000",
    oldPrice: 69800,
    price: 34900,
    description: "La opcion mas equilibrada para vender con volumen sin ir directo a la base completa.",
    cta: "Comprar Pro",
    highlighted: true,
    features: [
      "12.000 registros completos",
      "Mejor relacion cantidad / precio",
      "Mail o telefono en cada registro",
      "Muchos registros con ambos datos",
    ],
  },
  {
    name: "Pack Completo",
    displayName: "Completo",
    tag: "Todo Argentina",
    records: "21.151",
    oldPrice: 99800,
    price: 49900,
    description: "La base completa para cubrir todo Argentina de una sola vez y trabajar sin limites.",
    cta: "Comprar Completo",
    highlighted: false,
    features: [
      "21.151 registros nacionales",
      "340 rubros comerciales",
      "Cobertura federal",
      "Actualizaciones 2026 incluidas",
    ],
  },
];

const faqs = [
  {
    question: "Que recibo exactamente despues de comprar?",
    answer:
      "Recibís el archivo listo para descargar en Excel y CSV. Pagás, se aprueba la compra y descargás sin esperar que nadie te responda.",
  },
  {
    question: "Los registros traen mail, telefono o las dos cosas?",
    answer:
      "Cada registro trae al menos un punto de contacto: mail o teléfono. En muchos casos vienen los dos. Si un dato no está, el otro igual te sirve para trabajar la base.",
  },
  {
    question: "Es suscripcion o pago unico?",
    answer:
      "Es pago único. Comprás una vez, descargás el archivo y lo usás cuando quieras.",
  },
  {
    question: "Es segura la compra?",
    answer:
      "Sí. El pago se procesa con Mercado Pago y la descarga se habilita recién cuando el pago figura aprobado.",
  },
];

function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR").format(value);
}

export function DirectoryLanding() {
  const [countdown, setCountdown] = useState(14 * 60 + 32);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [checkoutState, setCheckoutState] = useState<"form" | "processing">("form");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => (current <= 0 ? 15 * 60 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_name: "Directorio Comercial Argentino",
      content_category: "Lead Database",
      content_ids: ["directorio-comercial-argentino"],
      content_type: "product",
      currency: "ARS",
      value: 34900,
    });
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  function openCheckout(plan: Plan) {
    trackMetaEvent("InitiateCheckout", {
      content_name: plan.name,
      content_ids: [plan.displayName.toLowerCase()],
      content_type: "product",
      currency: "ARS",
      value: plan.price,
      num_items: 1,
    });
    setSelectedPlan(plan);
    setBuyerName("");
    setBuyerEmail("");
    setCheckoutState("form");
    setFormError("");
  }

  function closeCheckout() {
    setSelectedPlan(null);
    setCheckoutState("form");
    setFormError("");
  }

  async function processPurchase() {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setFormError("Completá nombre y email para continuar.");
      return;
    }

    if (!selectedPlan) {
      setFormError("No encontramos la opcion elegida.");
      return;
    }

    setFormError("");
    setCheckoutState("processing");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerName,
          buyerEmail,
          planName: selectedPlan.name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.initPoint) {
        throw new Error(data.error || "No se pudo generar el checkout.");
      }

      window.location.href = data.initPoint;
    } catch (error) {
      setCheckoutState("form");
      setFormError(error instanceof Error ? error.message : "No se pudo iniciar el pago.");
    }
  }

  function SectionIcon({ type }: { type: "database" | "filter" | "message" | "download" | "clock" | "shield" | "mail" | "check" }) {
    switch (type) {
      case "database":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <ellipse cx="12" cy="5" rx="7" ry="3" />
            <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "filter":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "message":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.3 8.3 0 0 1-3.8-.9L3 21l1.8-5.2A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "download":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <path d="M12 4v10" strokeLinecap="round" />
            <path d="m8 10 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19h14" strokeLinecap="round" />
          </svg>
        );
      case "clock":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "shield":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <path d="M12 3 5 6v6c0 4.2 2.8 7.7 7 9 4.2-1.3 7-4.8 7-9V6l-7-3Z" />
          </svg>
        );
      case "mail":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.1} viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  }

  return (
    <>
      <div className="relative z-50 border-b border-red-500/20 bg-[linear-gradient(90deg,#991b1b,#c2410c)] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white sm:px-4 sm:text-[11px] md:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 sm:gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="leading-tight sm:hidden">50% OFF hoy. Descarga inmediata.</span>
          <span className="hidden leading-tight sm:inline">Lanzamiento 2026: 50% off solo por hoy. Descarga inmediata en Excel / CSV.</span>
          <span className="hidden md:inline">Faltan: {minutes}m {seconds.toString().padStart(2, "0")}s</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#05060a]/88 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0 flex items-center gap-3">
            <div className="rounded-xl border border-s-accent/20 bg-s-accent px-3 py-2 text-base font-black tracking-tight text-black shadow-[0_0_20px_rgba(0,255,163,0.18)] sm:text-lg">
              DCA
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-s-accent">SODI DATA</span>
              <span className="block truncate text-sm font-bold tracking-wide text-white sm:text-base">Directorio Comercial Argentino</span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-s-sub lg:flex">
            <a href="#beneficios" className="transition hover:text-white">Beneficios</a>
            <a href="#incluye" className="transition hover:text-white">Incluye</a>
            <a href="#precios" className="transition hover:text-white">Opciones</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </nav>

          <a href="#precios" className="btn-primary shrink-0 px-4 py-2.5 text-sm font-bold sm:px-5 sm:py-3">
            Comprar ahora
          </a>
        </div>
      </header>

      <main className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,163,0.08),transparent_26%),radial-gradient(circle_at_20%_30%,rgba(255,107,0,0.05),transparent_18%)]" />

        <section className="relative overflow-hidden border-b border-white/6 py-10 sm:py-12 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
            <div className="hero-enter text-center lg:col-span-6 lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-s-accent/15 bg-s-accent/8 px-3.5 py-1.5 text-xs font-semibold text-s-accent lg:mb-6">
                <span className="h-2 w-2 rounded-full bg-s-accent" />
                Base comercial actualizada a mayo 2026
              </div>

              <h1 className="mx-auto max-w-4xl font-heading text-[2.45rem] font-extrabold tracking-[-0.05em] text-white sm:text-5xl lg:mx-0 lg:text-[5.2rem] lg:leading-[0.95]">
                21.151 empresas argentinas
                <span className="block text-s-accent">listas para contactar.</span>
              </h1>

              <p className="mx-auto mt-4 max-w-3xl text-lg font-semibold text-white/88 sm:text-xl lg:mx-0 lg:text-2xl">
                Filtrá por rubro, provincia y ciudad. Descarga inmediata en Excel y CSV.
              </p>

              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-s-sub sm:text-base lg:mx-0 lg:text-lg">
                Comprás, descargás y empezás a contactar el mismo día. Todos los registros traen al menos mail o teléfono, y muchos también incluyen WhatsApp.
              </p>

              <div className="mx-auto mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mx-0">
                {[
                  { value: "21.151", label: "Registros" },
                  { value: "340", label: "Rubros" },
                  { value: "1+", label: "Mail o telefono" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-4 text-center shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="font-heading text-2xl font-black text-s-accent sm:text-[1.9rem]">{item.value}</div>
                    <div className="mt-1 text-xs font-medium text-s-sub">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row lg:mx-0">
                <a href="#precios" className="btn-primary pulse-soft w-full px-6 py-4 text-center text-base font-black sm:w-auto sm:min-w-[250px] sm:px-8 sm:text-lg">
                  Comprar y descargar
                </a>
                <a href="#incluye" className="btn-secondary w-full px-6 py-4 text-center font-bold sm:w-auto sm:min-w-[190px] sm:px-8">
                  Ver que incluye
                </a>
              </div>

              <div className="mx-auto mt-5 flex max-w-md flex-col gap-2 text-xs text-s-sub sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5 lg:mx-0 lg:justify-start">
                <span><span className="mr-1 text-s-accent">✓</span>Excel / CSV</span>
                <span><span className="mr-1 text-s-accent">✓</span>Pago único</span>
                <span><span className="mr-1 text-s-accent">✓</span>Mail o teléfono por registro</span>
              </div>
            </div>

            <div className="hero-enter hero-enter-delay lg:col-span-6">
              <div className="relative mx-auto w-full max-w-[720px] lg:max-w-none">
                <div className="absolute -inset-3 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(0,255,163,0.18),transparent_60%)] blur-3xl" />
                <div className="soft-float relative overflow-hidden rounded-[28px] border border-white/10 bg-black/35 shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
                  <Image
                    src="/directorio/herodca.png"
                    alt="Vista previa del Directorio Comercial Argentino"
                    width={1460}
                    height={1024}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-4 text-center shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:text-left">
                    <div className="text-sm font-bold text-white">Cada registro trae contacto usable</div>
                    <div className="mt-1 text-sm text-s-sub">Siempre hay mail o telefono. En muchos casos, tambien WhatsApp.</div>
                  </div>
                  <div className="rounded-2xl border border-s-accent/18 bg-s-accent/10 px-4 py-4 text-center shadow-[0_12px_28px_rgba(0,255,163,0.08)] sm:text-left">
                    <div className="text-sm font-bold text-white">Compra simple y entrega inmediata</div>
                    <div className="mt-1 text-sm text-s-sub">Pagás, se aprueba la compra y descargás el archivo listo para usar.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/6 bg-s-surface/40 py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
            {[
              { text: "21.151 registros comerciales", icon: "database" as const },
              { text: "340 rubros del mercado argentino", icon: "filter" as const },
              { text: "Excel / CSV / Sheets", icon: "download" as const },
              { text: "3.364 con WhatsApp", icon: "message" as const },
              { text: "Entrega inmediata", icon: "clock" as const },
            ].map((item) => (
              <div key={item.text} className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-4 text-center text-sm font-semibold text-white/86">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-s-accent/15 bg-s-accent/10 text-s-accent">
                  <SectionIcon type={item.icon} />
                </div>
                {item.text}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-5xl px-4 text-center text-sm text-s-sub sm:px-6 lg:px-8">
            <span className="font-semibold text-s-accent">Teléfonos + WhatsApp</span> cuando están disponibles. Todos los registros incluyen al menos mail o teléfono como punto de contacto.
          </p>
        </section>

        <section id="beneficios" className="py-14 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <h2 className="font-heading text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
                Una oferta simple de entender y fácil de pagar.
              </h2>
              <p className="mt-4 text-base text-s-sub sm:text-lg">
                No hay demos, llamadas ni vueltas raras. Entrás, entendés el producto, elegís una opción y la descargás.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "La base ya viene armada",
                  text: "No comprás una promesa ni un servicio para armar después. La base ya viene lista para filtrar y trabajar.",
                  icon: "database" as const,
                },
                {
                  title: "La compra es directa",
                  text: "Oferta clara, precios claros y botón de compra directo. Sin pasos innecesarios.",
                  icon: "download" as const,
                },
                {
                  title: "Pensada para tráfico frío",
                  text: "La persona entra, entiende qué está comprando y decide rápido sin tener que leer veinte pantallas.",
                  icon: "shield" as const,
                },
                {
                  title: "Lista para autoservicio",
                  text: "La compra se aprueba y la descarga se habilita sin depender de mensajes, mails ni respuestas manuales.",
                  icon: "check" as const,
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[28px] border border-white/6 bg-white/[0.03] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-7 md:text-left">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-s-accent/15 bg-s-accent/10 text-s-accent md:mx-0 md:mb-4">
                    <SectionIcon type={item.icon} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-s-sub">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="incluye" className="border-y border-white/6 bg-s-surface/45 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div className="text-center lg:text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-s-accent">Que incluye la compra</p>
                <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl">
                  Todo lo necesario para empezar a trabajarla.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-s-sub sm:text-lg lg:mx-0">
                  Te llevás un archivo ordenado, descargable y listo para filtrar por rubro, ciudad o provincia según cómo quieras trabajarlo.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  "Archivo Excel y CSV listo para descargar",
                  "Registros segmentados por rubro y provincia",
                  "Cada registro trae mail o teléfono",
                  "Muchos registros incluyen ambas cosas",
                  "Descarga habilitada apenas el pago figura aprobado",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-4 sm:px-5">
                    <span className="text-s-accent"><SectionIcon type={index === 0 ? "download" : index === 1 ? "filter" : index === 2 ? "mail" : index === 3 ? "message" : "shield"} /></span>
                    <span className="text-sm font-medium text-white/86">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Elegís una opción",
                  text: "Son 3 opciones distintas según volumen y necesidad.",
                },
                {
                  step: "2",
                  title: "Descargas",
                  text: "Recibís el archivo y lo abrís enseguida en Excel o donde trabajes.",
                },
                {
                  step: "3",
                  title: "Lo trabajás",
                  text: "Filtrás la base y empezás a contactar por mail, teléfono o WhatsApp cuando esté disponible.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-[26px] border border-white/6 bg-black/20 px-5 py-6 text-center sm:px-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-s-accent/20 bg-s-accent/10 font-heading text-lg font-black text-s-accent">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-s-sub">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="precios" className="relative py-14 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(0,255,163,0.06),transparent_26%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="inline-flex rounded-full border border-s-accent/20 bg-s-accent/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-s-accent">
                Opciones en pesos argentinos
              </span>
              <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl">
                Elegí una de las 3 opciones
              </h2>
              <p className="mt-4 text-base text-s-sub sm:text-lg">
                Las 3 tienen la misma lógica. Lo que cambia es la cantidad de registros que te llevás.
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3 lg:gap-8">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative mx-auto flex w-full max-w-xl flex-col justify-between rounded-[28px] border p-5 sm:rounded-[32px] sm:p-8 lg:max-w-none ${
                    plan.highlighted
                      ? "border-s-accent/35 bg-[linear-gradient(180deg,rgba(8,20,16,0.96),rgba(7,7,10,0.98))] shadow-[0_0_40px_rgba(0,255,163,0.1)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(12,12,16,0.96),rgba(7,7,10,0.98))]"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#f3c623] px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-black">
                      Mas elegido
                    </div>
                  )}

                  <div>
                    <div className={`mx-auto w-max rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] lg:mx-0 ${plan.name === "Pack Completo" ? "bg-white text-black" : "bg-white/[0.04] text-s-sub"}`}>
                      {plan.tag}
                    </div>

                    <h3 className="mt-5 text-center font-heading text-[2rem] font-extrabold text-white sm:mt-6 sm:text-3xl lg:text-left">{plan.displayName}</h3>
                    <p className="mt-2 text-center text-sm text-s-sub lg:text-left">{plan.description}</p>

                    <div className="mt-6 border-y border-white/8 py-5 text-center">
                      <div className={`font-heading text-[2.2rem] font-black sm:text-4xl ${plan.highlighted ? "text-s-accent" : "text-white"}`}>
                        {plan.records}
                      </div>
                      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-s-dim">Registros</div>
                    </div>

                    <div className="mt-6 text-center">
                      <div className="text-xs text-s-dim line-through">Normal: ${formatARS(plan.oldPrice)}</div>
                      <div className="mt-1 flex items-end justify-center gap-2">
                        <span className="font-heading text-[2.8rem] font-black tracking-[-0.05em] text-white sm:text-5xl">${formatARS(plan.price)}</span>
                        <span className="pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-s-sub">ARS</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-s-accent">Pago unico / acceso permanente</div>
                    </div>

                    <ul className="mt-7 space-y-3 border-t border-white/8 pt-6 text-sm text-s-sub">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-left">
                          <span className="mt-0.5 text-s-accent">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => openCheckout(plan)}
                    className={plan.highlighted ? "btn-primary pulse-soft mt-8 w-full px-6 py-4 text-base font-black" : "btn-secondary mt-8 w-full px-6 py-4 text-base font-bold"}
                  >
                    {plan.cta}
                  </button>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-8 max-w-5xl">
              <a href="#precios" className="btn-primary pulse-soft block w-full px-6 py-5 text-center text-xl font-black tracking-[0.04em]">
                Comprar y descargar
              </a>
            </div>

            <div className="mx-auto mt-6 max-w-5xl rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,10,14,0.96),rgba(7,7,10,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[1.05fr_1.15fr_1fr] lg:items-center">
                <div className="flex items-center gap-4 border-b border-white/8 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-s-accent/20 bg-s-accent/10 text-s-accent">
                    <SectionIcon type="shield" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Compra segura</p>
                    <p className="mt-1 text-sm leading-relaxed text-s-sub">Pagás de forma protegida y la descarga se habilita apenas el pago queda aprobado.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-b border-white/8 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
                    <Image
                      src="/brands/mercadopago.svg"
                      alt="Mercado Pago"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Mercado Pago</p>
                    <p className="mt-1 text-sm leading-relaxed text-s-sub">Pagá con tarjeta, débito, crédito o con los medios que Mercado Pago tenga habilitados para vos.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-white">
                  <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-3 text-center">Tarjetas</div>
                  <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-3 text-center">Débito</div>
                  <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-3 text-center">Crédito</div>
                  <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-3 text-center">Transferencia</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-white/6 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-3xl font-extrabold text-white">Preguntas frecuentes</h2>
              <p className="mt-3 text-s-sub">Respuestas cortas para sacar dudas y pagar tranquilo.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const open = faqOpen === index;
                return (
                  <div key={faq.question} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5 sm:px-6">
                    <button
                      onClick={() => setFaqOpen(open ? null : index)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="font-bold text-white">{faq.question}</span>
                      <span className={`text-s-accent transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                    </button>
                    {open && <p className="mt-4 text-sm leading-relaxed text-s-sub">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/6 bg-s-surface/40 py-12 text-xs text-s-sub">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="sodi-mark text-lg">SODI</span>
                <span className="text-sm font-bold text-white">Directorio Comercial Argentino</span>
              </div>
              <p className="mt-4 max-w-sm leading-relaxed">
                Base comercial organizada para comprar, descargar y empezar a trabajar sin vueltas.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Accesos rapidos</h4>
              <ul className="space-y-2">
                <li><a href="#beneficios" className="transition hover:text-white">Beneficios</a></li>
                <li><a href="#precios" className="transition hover:text-white">Opciones</a></li>
                <li><a href="#faq" className="transition hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Compra y descarga</h4>
              <p className="leading-relaxed">
                Pagás con Mercado Pago, se valida la compra y se habilita la descarga del archivo correspondiente.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {selectedPlan && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,14,0.98),rgba(7,7,10,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
            <button onClick={closeCheckout} className="absolute right-4 top-4 text-s-sub transition hover:text-white">
              ✕
            </button>

            {checkoutState === "form" && (
              <>
                <div className="border-b border-white/8 bg-s-muted/55 px-6 py-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-s-accent">Estás comprando</p>
                  <h3 className="mt-2 font-heading text-3xl font-extrabold text-white">{selectedPlan.displayName}</h3>
                  <p className="mt-2 text-sm text-s-sub">Vas a pasar al checkout oficial de Mercado Pago para completar la compra.</p>
                </div>

                <div className="space-y-5 px-6 py-6">
                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
                    <span className="text-sm font-semibold text-s-sub">Total</span>
                    <span className="font-heading text-3xl font-black text-white">${formatARS(selectedPlan.price)}</span>
                  </div>

                  <div className="rounded-2xl border border-s-accent/25 bg-s-accent/8 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-2 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                        <Image
                          src="/brands/mercadopago.svg"
                          alt="Mercado Pago"
                          width={32}
                          height={32}
                          className="h-7 w-7 object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white">Compra segura con Mercado Pago</div>
                        <div className="mt-1 text-xs leading-relaxed text-s-sub">
                          Podés pagar con tarjeta, débito, crédito o con los medios que Mercado Pago tenga habilitados para vos.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-s-dim">Nombre completo</label>
                      <input
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Ej: Carlos Perez"
                        className="w-full rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-s-accent/35"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-s-dim">Email</label>
                      <input
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="Ej: carlos@empresa.com.ar"
                        className="w-full rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-s-accent/35"
                      />
                    </div>
                  </div>

                  {formError && <p className="text-sm text-red-300">{formError}</p>}

                  <button onClick={processPurchase} className="btn-primary w-full px-6 py-4 text-base font-black">
                    Ir a pagar con Mercado Pago
                  </button>

                  <p className="text-center text-[11px] text-s-dim">
                    Después del pago aprobado se habilita la descarga del archivo.
                  </p>
                </div>
              </>
            )}

            {checkoutState === "processing" && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-s-accent" />
                <h3 className="mt-6 font-heading text-2xl font-extrabold text-white">Generando checkout...</h3>
                <p className="mt-3 text-sm text-s-sub">
                  Te estamos redirigiendo a Mercado Pago.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
