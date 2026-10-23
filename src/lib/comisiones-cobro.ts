// Tarifas de cobro de la calculadora /herramientas/calculadora-comisiones-cobro.
// Regla: cada tasa sale de la página oficial del proveedor, leída en TARIFAS_CONSULTA. Si el proveedor
// no publica una tasa, el medio queda con rate null y la calculadora muestra "sin tarifa pública" (nunca se estima).
// Al actualizar: releer cada URL de `source`, cambiar TARIFAS_CONSULTA y el informe en lagos-lab
// projects/contenido-seo/sodi-calculadora-<fecha>.md (Tarea sodi-4e6e, 23/10/2026).

export const TARIFAS_CONSULTA = "2026-10-23";
export const TARIFAS_CONSULTA_LABEL = "23/10/2026";

export const IVA_RATE = 21;
export const IVA_SOURCE = {
  label: "Ley de IVA, art. 28 (Infoleg)",
  url: "https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42701/texact.htm",
};

export interface TermOption {
  id: string;
  label: string;
  /** Porcentaje sin IVA, o null si el proveedor no publica tasa. */
  rate: number | null;
}

export interface PaymentMethod {
  id: string;
  label: string;
  terms: TermOption[];
  note?: string;
}

export interface Provider {
  id: "mercadopago" | "mobbex" | "modo";
  name: string;
  source: { label: string; url: string };
  validity: string;
  methods: PaymentMethod[];
  note: string;
}

const now = (rate: number | null, label = "Al instante"): TermOption => ({ id: "0", label, rate });
const days = (d: number, rate: number): TermOption => ({ id: String(d), label: `${d} días`, rate });
const MP_LINK_TERMS = [now(6.29), days(10, 4.39), days(18, 3.39), days(35, 1.49)];

export const PROVIDERS: Provider[] = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    source: { label: "Comisiones y cargos para individuos y vendedores", url: "https://www.mercadopago.com.ar/ayuda/26748" },
    validity: "Vigente desde el 19/10/2026 según Mercado Pago",
    note: "Tasa general publicada por Mercado Pago, sin IVA. Tu cuenta puede mostrar otra según tu provincia o condición; confirmala antes de fijar precios.",
    methods: [
      { id: "link", label: "Link de pago (cualquier medio)", terms: MP_LINK_TERMS },
      { id: "checkout", label: "Checkout en tu web (cualquier medio)", terms: MP_LINK_TERMS },
      { id: "qr-dinero", label: "QR, paga con dinero en Mercado Pago", terms: [now(0.8)] },
      { id: "qr-debito", label: "QR, paga con débito", terms: [now(1.35), days(2, 0.85)] },
      { id: "qr-credito", label: "QR, paga con crédito", terms: [now(5.99), days(10, 4.19)] },
      { id: "qr-prepaga", label: "QR, paga con prepaga", terms: [now(3.75)] },
      { id: "point-debito", label: "Point, débito", terms: [now(2.99), days(2, 2.75)] },
      { id: "point-credito", label: "Point, crédito", terms: [now(5.99), days(5, 5.19), days(10, 4.19)] },
      { id: "point-prepaga", label: "Point, prepaga", terms: [now(3.75), days(3, 3.5)] },
    ],
  },
  {
    id: "mobbex",
    name: "Mobbex",
    source: { label: "Planes (Plan Essential)", url: "https://www.mobbex.com/planes" },
    validity: "Plan Essential, por transacción aprobada",
    note: "Plan Essential publicado por Mobbex, sin IVA. Mobbex no publica una tasa distinta por plazo: el plazo depende de la procesadora (su FAQ dice que en general débito se acredita en 2 días hábiles y crédito entre 10 y 18). El Plan Enterprise tiene arancel a medida.",
    methods: [
      { id: "debito", label: "Débito", terms: [now(1.9, "Según procesadora")] },
      { id: "credito", label: "Crédito y prepagas", terms: [now(2.6, "Según procesadora")] },
      { id: "suscripciones", label: "Suscripciones", terms: [now(3.9, "Según procesadora")] },
      { id: "enterprise", label: "Plan Enterprise (arancel a medida)", terms: [now(null, "A medida")] },
    ],
  },
  {
    id: "modo",
    name: "MODO",
    source: { label: "MODO para comercios", url: "https://www.modo.com.ar/comercios" },
    validity: "Sin tarifa pública",
    note: "MODO no publica un porcentaje: dice que no suma costos ni comisiones adicionales y que cobrás las mismas comisiones que con tarjeta. La tasa la define tu banco o tu procesadora; pedila por escrito.",
    methods: [
      { id: "qr", label: "QR en el local", terms: [now(null, "Según tu banco")] },
      { id: "online", label: "Tienda online", terms: [now(null, "Según tu banco")] },
    ],
  },
];

export interface FeeResult {
  rate: number;
  commission: number;
  iva: number;
  total: number;
  net: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Comisión = monto x tasa; IVA 21% sobre la comisión; neto = monto - comisión - IVA. Redondeo a centavos. */
export function computeFee(amount: number, rate: number): FeeResult {
  const commission = round2((amount * rate) / 100);
  const iva = round2((commission * IVA_RATE) / 100);
  const total = round2(commission + iva);
  return { rate, commission, iva, total, net: round2(amount - total) };
}

export function findProvider(id: string) {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

export const formatArs = (n: number) =>
  "$ " + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatRate = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";

/** Rango del monto para analítica (sin el monto exacto). */
export function amountBucket(amount: number) {
  if (amount < 10_000) return "<10k";
  if (amount < 100_000) return "10k-100k";
  if (amount < 1_000_000) return "100k-1M";
  return ">=1M";
}
