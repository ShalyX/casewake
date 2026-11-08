import { timingSafeEqual } from "node:crypto";

/** Historical examples remain available for reproduction.
 *  Valid digest inspection is public; recording and job recovery remain protected.
 *  Sponsor credentials and the reviewer key stay server-side.
 */
export const PUBLIC_DEMO_TRANSACTIONS = [
  {
    digest: "8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA",
    label: "Reviewed cancellation case",
    detail: "Real duplicate cancellation · ShalyX-reviewed integration resolution",
  },
  {
    digest: "HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV",
    label: "Recall reviewed resolution",
    detail: "Distinct real failure · exact reviewed Walrus blob",
  },
  {
    digest: "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6",
    label: "Recovered precedent",
    detail: "InsufficientCoinBalance · matching simulation-tested runbook",
  },
  {
    digest: "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue",
    label: "Second recurrence",
    detail: "A separate real failure with the same verified command type",
  },
  {
    digest: "Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp",
    label: "Negative control",
    detail: "Unrelated MoveAbort · no coin-split runbook",
  },
] as const;

export const isPublicDemoMode = () => process.env.PUBLIC_DEMO_MODE === "true";

export function isReviewerKeyValid(suppliedKey: string | null | undefined) {
  const requiredKey = process.env.WORKSPACE_WRITE_KEY;
  if (!requiredKey || !suppliedKey) return false;
  const supplied = Buffer.from(suppliedKey, "utf8");
  const expected = Buffer.from(requiredKey, "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
