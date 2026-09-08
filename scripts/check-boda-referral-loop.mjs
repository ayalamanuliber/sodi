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

const publishedInvitation = readFileSync("src/app/boda/[slug]/page.tsx", "utf8");
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

const completionCall = trial.match(/trackEvent\("guest_referral_trial_completion",\s*\{([^}]*)\}\)/s)?.[1] ?? "";
for (const forbidden of ["slug", "token", "name", "nombre", "trial_id", "code"]) {
  assert.equal(completionCall.includes(forbidden), false, `Completion event must not contain ${forbidden}`);
}

console.log("PASS SODI Bodas referral loop: canonical attribution propagates without invitation identifiers and all four funnel events exist.");
