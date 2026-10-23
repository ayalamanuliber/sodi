import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { guestReferralTrialHref, isGuestWeddingReferral } from "../src/lib/boda-referral.ts";

const canonical = "?utm_source=invitacion&utm_medium=guest_attribution&utm_campaign=sodi_bodas";

assert.equal(isGuestWeddingReferral(canonical), true);
assert.equal(isGuestWeddingReferral("?utm_source=invitacion&utm_medium=other&utm_campaign=sodi_bodas"), false);
assert.equal(
  guestReferralTrialHref(`${canonical}&i=private-code&slug=private-event`),
  `/boda/prueba${canonical}`,
  "Only the canonical, non-identifying attribution parameters may propagate",
);
assert.equal(guestReferralTrialHref("?utm_source=other"), "/boda/prueba");

// Published invitations render at /invitacion/[id] through PublishedWedding -> InvitationPreview (mode="published");
// src/app/boda/[slug]/page.tsx is a fixed legacy template and never carried the guest attribution footer.
const publishedRoute = readFileSync("src/app/invitacion/[id]/page.tsx", "utf8");
const publishedWedding = readFileSync("src/components/boda-studio/PublishedWedding.tsx", "utf8");
const publishedInvitation = readFileSync("src/components/boda-commercial/InvitationPreview.tsx", "utf8");
assert.match(publishedRoute, /<PublishedWedding\b/, "Published invitation route must render PublishedWedding");
assert.match(publishedWedding, /<InvitationPreview\b[^>]*mode="published"/, "PublishedWedding must render InvitationPreview in published mode");
const landingAnalytics = readFileSync("src/components/boda-commercial/WeddingAnalytics.tsx", "utf8");
const trial = readFileSync("src/components/boda-commercial/WeddingTrial.tsx", "utf8");

for (const eventName of [
  "wedding_guest_attribution_click",
  "guest_referral_entry",
  "guest_referral_trial_start",
  "guest_referral_trial_completion",
]) {
  assert.ok(
    `${publishedInvitation}\n${landingAnalytics}\n${trial}`.includes(`\"${eventName}\"`)
      || `${publishedInvitation}\n${landingAnalytics}\n${trial}`.includes(`'${eventName}'`),
    `Missing referral event: ${eventName}`,
  );
}

const attribution = publishedInvitation.match(/<aside className=\{styles\.sodiAttribution\}[\s\S]*?<\/aside>/)?.[0] ?? "";
assert.ok(attribution, "Published invitation must include the SODI Bodas attribution footer");
assert.ok(attribution.includes(`href="/boda${canonical}"`), "Attribution link must carry exactly the canonical referral parameters");
assert.match(attribution, /trackEvent\("wedding_guest_attribution_click"/, "Attribution link must fire wedding_guest_attribution_click");
const clickCall = attribution.match(/trackEvent\("wedding_guest_attribution_click",\s*\{([^}]*)\}\)/s)?.[1] ?? "";
for (const forbidden of ["slug", "token", "name", "nombre", "eventId", "guestLabel", "code"]) {
  assert.equal(clickCall.includes(forbidden), false, `Attribution click event must not contain ${forbidden}`);
}
const beforeAttribution = publishedInvitation.slice(0, publishedInvitation.indexOf("<aside className={styles.sodiAttribution}"));
assert.equal(/\{!isPublished\s*&&\s*$/.test(beforeAttribution.trimEnd()), false, "Attribution footer must not be hidden in published mode");

const completionCall = trial.match(/trackEvent\("guest_referral_trial_completion",\s*\{([^}]*)\}\)/s)?.[1] ?? "";
for (const forbidden of ["slug", "token", "name", "nombre", "trial_id", "code"]) {
  assert.equal(completionCall.includes(forbidden), false, `Completion event must not contain ${forbidden}`);
}

console.log("PASS SODI Bodas referral loop: canonical attribution propagates without invitation identifiers and all four funnel events exist.");
