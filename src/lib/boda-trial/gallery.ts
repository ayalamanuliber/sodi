export const INVITATION_FALLBACK_IMAGES = [
  "/invitaciones-boda/couple-hero.webp",
  "/invitaciones-boda/couple-ceremony.webp",
  "/invitaciones-boda/couple-celebration.webp",
  "/invitaciones-boda/couple-walk.webp",
  "/invitaciones-boda/couple-toast.webp",
] as const;

export const INVITATION_GALLERY_SLOT_COUNT = INVITATION_FALLBACK_IMAGES.length;

export function resolveInvitationImages(photoUrls: string[] = []) {
  return INVITATION_FALLBACK_IMAGES.map(
    (fallback, index) => photoUrls[index]?.trim() || fallback,
  );
}

export function invitationGalleryAlt(index: number) {
  return `Momento ficticio ${index + 1} de la misma pareja de la invitación`;
}
