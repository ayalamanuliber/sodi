export const WEDDING_PUBLICATION_SCOPES = [
  {
    id: "publish-organize",
    label: "Invitación y confirmaciones",
    description: "Ya tenemos los textos, las fotos y la lista bastante preparados.",
    includes: ["invitación para compartir", "enlaces para cada grupo", "lista de respuestas", "panel y descarga"],
  },
  {
    id: "guided-start",
    label: "Ayuda para dejar todo listo",
    description: "Queremos ayuda para preparar la invitación y cargar la primera lista.",
    includes: ["invitación y confirmaciones", "carga inicial a acordar", "revisión de fotos y textos", "ayuda para empezar"],
  },
  {
    id: "custom",
    label: "Tenemos una idea especial",
    description: "Nos gustaría otro diseño, más momentos del festejo o una sección especial.",
    includes: ["revisión de la idea", "alcance y presupuesto antes de avanzar"],
  },
] as const;

export type WeddingPublicationScopeId = typeof WEDDING_PUBLICATION_SCOPES[number]["id"];

export const SODI_WEDDING_WHATSAPP_NUMBER = "5491138696958";

type PublicationAnalyticsContext = {
  themeId: string;
  scopeId: WeddingPublicationScopeId;
  approximateGuests?: string;
  note?: string;
};

type PublicationMessageInput = {
  partnerOne: string;
  partnerTwo: string;
  weddingDate: string;
  themeName: string;
  scopeId: WeddingPublicationScopeId;
  approximateGuests?: string;
  note?: string;
};

function formatWeddingDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "fecha a confirmar";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function buildWeddingPublicationMessage({
  partnerOne,
  partnerTwo,
  weddingDate,
  themeName,
  scopeId,
  approximateGuests,
  note,
}: PublicationMessageInput) {
  const scope = WEDDING_PUBLICATION_SCOPES.find((item) => item.id === scopeId)
    ?? WEDDING_PUBLICATION_SCOPES[0];
  const names = [partnerOne.trim(), partnerTwo.trim()].filter(Boolean).join(" y ") || "Somos una pareja";

  return [
    `Hola SODI, somos ${names}. Armamos una invitación de prueba con el estilo ${themeName}.`,
    `La boda es el ${formatWeddingDate(weddingDate)}.`,
    approximateGuests?.trim() ? `Calculamos unas ${approximateGuests.trim()} personas.` : "",
    `Queremos consultar: ${scope.label.toLowerCase()}.`,
    note?.trim() ? `Nos gustaría resolver: ${note.trim()}` : "",
    "¿Podemos revisar qué incluye la propuesta, cuánto cuesta y cómo seguimos para usarla en nuestra boda?",
  ].filter(Boolean).join("\n");
}

export function buildWeddingPublicationWhatsAppUrl(
  message: string,
  phoneNumber = SODI_WEDDING_WHATSAPP_NUMBER,
) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function publicationOptionsViewProperties(themeId: string) {
  return {
    surface: "trial_panel",
    theme: themeId,
  } as const;
}

export function publicationScopeSelectProperties(scopeId: WeddingPublicationScopeId) {
  return {
    scope: scopeId,
    surface: "trial_panel",
  } as const;
}

export function publishInterestProperties({
  themeId,
  scopeId,
  approximateGuests,
  note,
}: PublicationAnalyticsContext) {
  return {
    scope: scopeId,
    theme: themeId,
    has_guest_estimate: Boolean(approximateGuests?.trim()),
    has_note: Boolean(note?.trim()),
  } as const;
}

export function weddingWhatsAppOpenProperties(scopeId: WeddingPublicationScopeId) {
  return {
    location: "trial_publication",
    scope: scopeId,
  } as const;
}
