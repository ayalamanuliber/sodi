import type { WeddingTrialWorkspace } from "./schema.ts";

type Data = Record<string, unknown>;
const object = (v: unknown): v is Data => Boolean(v && typeof v === "object" && !Array.isArray(v));
const text = (v: unknown, max = 10000): v is string => typeof v === "string" && v.length <= max;
const id = (v: unknown): v is string => text(v, 200) && /^[a-zA-Z0-9_-]+$/.test(v);
const oneOf = (v: unknown, values: readonly string[]) => typeof v === "string" && values.includes(v);
const integer = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && Number(v) >= min && Number(v) <= max;
const instant = (v: unknown): v is string => text(v, 40) && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
const optional = (v: unknown, check: (value: unknown) => boolean) => v === undefined || check(v);
const keys = (v: Data, allowed: string[]) => Object.keys(v).every((key) => allowed.includes(key));
function editableDate(value: unknown) {
  return value === "" || (text(value, 10) && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
}

/** A v3 draft may contain unfinished text/date inputs, but never invalid references,
 * impossible RSVP counts, arbitrary design tokens or an unlocked publication.
 * The three later design controls remain optional for existing v3 drafts; the
 * existing design-default merger supplies defaults without changing saved choices.
 */
export function validateWeddingTrial(value: unknown): value is WeddingTrialWorkspace {
  if (!object(value) || value.version !== 3 || !keys(value, ["version", "account", "event", "content", "guests", "rsvps", "publication", "design"])) return false;
  const { account, event, content, publication, design, guests, rsvps } = value;
  if (!object(account) || !object(event) || !object(content) || !object(publication) || !object(design) || !Array.isArray(guests) || !Array.isArray(rsvps)) return false;
  if (!keys(account, ["id", "kind"]) || !id(account.id) || account.kind !== "anonymous_trial") return false;
  if (!keys(event, ["id", "accountId", "slug", "themeId", "status", "publicationStatus", "createdAt", "updatedAt", "expiresAt"]) || !id(event.id) || event.accountId !== account.id || !text(event.slug, 200) || !/^[a-z0-9-]+$/.test(event.slug)) return false;
  if (!oneOf(event.themeId, ["cobalto", "bosque", "nocturno", "clasico", "romantico", "campestre"]) || !oneOf(event.status, ["active", "expired", "converted"]) || event.publicationStatus !== "locked") return false;
  if (!instant(event.createdAt) || !instant(event.updatedAt) || !instant(event.expiresAt) || Date.parse(event.updatedAt) < Date.parse(event.createdAt) || Date.parse(event.expiresAt) <= Date.parse(event.createdAt) || Date.parse(event.expiresAt) - Date.parse(event.createdAt) > 7 * 86400000) return false;
  const contentFields = ["partnerOne", "partnerTwo", "ceremonyLocation", "celebrationLocation", "message", "story", "dressCode"];
  if (!keys(content, ["eventId", "date", "ceremonyTime", "celebrationTime", "ceremonyAddress", "celebrationAddress", ...contentFields]) || content.eventId !== event.id || !contentFields.every((key) => text(content[key])) || !editableDate(content.date)) return false;
  if (![content.ceremonyTime, content.celebrationTime].every((v) => v === "" || typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)) || ![content.ceremonyAddress, content.celebrationAddress].every((v) => optional(v, text))) return false;
  if (!keys(publication, ["eventId", "status", "publicUrl", "exportStatus"]) || publication.eventId !== event.id || publication.status !== "locked" || publication.exportStatus !== "locked" || publication.publicUrl !== null) return false;
  const tokens: Record<string, string[]> = {
    paletteId: ["forest-gold", "olive-clay", "cobalt-ivory", "ink-silver"], typographyId: ["editorial", "contemporary", "romantic"], coverId: ["cinematic", "split"], monogramId: ["seal", "initials", "wordmark"], galleryId: ["mosaic", "film"], ornamentId: ["quiet", "balanced", "ceremonial"],
  };
  if (!keys(design, [...Object.keys(tokens), "samplePhotosEnabled", "textPlacementId", "photoFocusId", "contrastId"]) || !Object.entries(tokens).every(([key, choices]) => oneOf(design[key], choices)) || typeof design.samplePhotosEnabled !== "boolean") return false;
  if (![design.textPlacementId, design.photoFocusId].every((v) => optional(v, (x) => oneOf(x, ["left", "center", "right"]))) || !optional(design.contrastId, (v) => oneOf(v, ["soft", "balanced", "strong"]))) return false;
  if (guests.length > 12 || rsvps.length > guests.length) return false;
  const byGuest = new Map<string, Data>();
  for (const guest of guests) {
    if (!object(guest) || !keys(guest, ["id", "eventId", "name", "passLimit", "status", "sent", "openedAt", "menu", "note"]) || !id(guest.id) || byGuest.has(guest.id) || guest.eventId !== event.id || !text(guest.name) || !guest.name.trim() || !integer(guest.passLimit, 1, 20) || !oneOf(guest.status, ["pending", "confirmed", "declined"]) || typeof guest.sent !== "boolean" || !text(guest.menu, 500) || !text(guest.note) || !optional(guest.openedAt, (v) => v === null || instant(v))) return false;
    byGuest.set(guest.id, guest);
  }
  const responseIds = new Set<string>();
  const respondedGuests = new Set<string>();
  for (const rsvp of rsvps) {
    if (!object(rsvp) || !keys(rsvp, ["id", "eventId", "guestId", "attendance", "passes", "note", "submittedAt"]) || !id(rsvp.id) || responseIds.has(rsvp.id) || !id(rsvp.guestId) || respondedGuests.has(rsvp.guestId) || rsvp.eventId !== event.id || !oneOf(rsvp.attendance, ["confirmed", "declined"]) || !text(rsvp.note) || !instant(rsvp.submittedAt)) return false;
    const guest = byGuest.get(rsvp.guestId);
    if (!guest || guest.status !== rsvp.attendance || !integer(rsvp.passes, rsvp.attendance === "confirmed" ? 1 : 0, rsvp.attendance === "confirmed" ? Number(guest.passLimit) : 0)) return false;
    responseIds.add(rsvp.id); respondedGuests.add(rsvp.guestId);
  }
  return guests.every((guest) => guest.status === "pending" ? !respondedGuests.has(guest.id) : respondedGuests.has(guest.id));
}
