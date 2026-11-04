/** A public judge demo exposes ONLY these genuine, preverified public Sui digests.
 *  Local/private developer mode continues to support arbitrary authentic digests.
 *  Read-only sponsor credentials stay on the server.
 */
export const PUBLIC_DEMO_TRANSACTIONS = [
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

export function isAllowedPublicDemoDigest(digest: string) {
  return !isPublicDemoMode() ||
    PUBLIC_DEMO_TRANSACTIONS.some(item => item.digest === digest);
}
