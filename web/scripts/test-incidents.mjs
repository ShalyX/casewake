// Synthetic, deterministic contract checks. No chain claim is made by these fixtures.
import assert from "node:assert/strict";
import { fingerprintError, encodeMemory, decodeMemory, assessCase } from "../src/lib/incidents.ts";

const raw = "MoveAbort in 0xAAAABBBBCCCCDDDDEEEEFFFFAAAABBBBCCCCDDDDEEEEFFFF: module::func code 7";
const exact = fingerprintError(raw);
assert.equal(exact, fingerprintError(raw.replace(
  "0xAAAABBBBCCCCDDDDEEEEFFFFAAAABBBBCCCCDDDDEEEEFFFF",
  "0x1234567890abcdef1234567890abcdef1234567890abcdef"
)));
const sender = "0x" + "1".repeat(64);
const source = "4".repeat(43);
const successor = "5".repeat(43);
const explanation = "Changed the rejected Move call arguments and replayed the corrected transaction successfully.";
const obs = {
  digest: "6".repeat(43), network: "sui-mainnet", source: "Tatum Sui gRPC",
  observedAt: new Date().toISOString(), outcome: "failed", errorText: raw,
  fingerprint: exact, packageId: null, sender,
};
const incident = {
  schema: "incident-memory/v1", id: "fixture-1", digest: source, network: "sui-mainnet",
  fingerprint: exact, errorText: raw, packageId: null, sdkVersion: null,
  diagnosis: "A failed call had an incorrect argument",
  resolutionSteps: "The engineer corrected the argument and confirmed a separate executed follow-up.",
  evidenceUrl: "https://suivision.xyz/txblock/" + successor, reviewer: "test-engineer",
  verifiedAt: new Date().toISOString(), status: "human-verified",
  resolutionKind: "onchain-successor",
  validatedEvidence: {
    schema: "casewake-validated-evidence/v1",
    scope: "human-reviewed-successor-transaction",
    proofType: "tatum-executed-successor",
    originalDigest: source, successorDigest: successor,
    originalSender: sender, successorSender: sender,
    matchedOperations: ["move:0x123::module::method"],
    provider: "Tatum Sui gRPC", successorOutcome: "succeeded",
    reviewerConfirmedCausality: true, reviewedChange: explanation,
    verifiedAt: new Date().toISOString(), originalHistoricalRouteRepaired: false,
  },
};
const serialized = encodeMemory(incident);
assert.deepEqual(decodeMemory(serialized), incident);
assert.equal(assessCase(obs, incident, 0.1).verdict, "eligible-for-review");
assert.equal(assessCase({ ...obs, digest: source }, incident, 0.1).verdict, "incompatible");
assert.equal(assessCase({ ...obs, outcome: "succeeded" }, incident, 0.1).verdict, "incompatible");
assert.equal(assessCase({ ...obs, fingerprint: fingerprintError("InsufficientGas") }, incident, 0.1).verdict, "incompatible");
assert.equal(assessCase({ ...obs, packageId: "0x1" }, { ...incident, packageId: "0x2" }, 0.1).verdict, "incompatible");
assert.equal(assessCase(obs, { ...incident, sdkVersion: "2.0.0" }, 0.1).verdict, "incompatible");
assert.equal(assessCase(obs, { ...incident, errorText: "MoveAbort from another context" }, 0.1).verdict, "incompatible");
assert.equal(decodeMemory("malformed sample"), null);
assert.equal(decodeMemory(serialized.replace('"status":"human-verified"', '"status":"unverified"')), null);

function corrupted(change) {
  const proof = { ...incident.validatedEvidence };
  const copy = { ...incident, validatedEvidence: proof };
  change(copy, proof);
  return decodeMemory(encodeMemory(copy));
}
assert.equal(corrupted((_, p) => { p.originalDigest = "7".repeat(43); }), null);
assert.equal(corrupted((_, p) => { p.successorOutcome = "failed"; }), null);
assert.equal(corrupted((_, p) => { p.reviewerConfirmedCausality = false; }), null);
assert.equal(corrupted((_, p) => { p.successorSender = "0x" + "2".repeat(64); }), null);
assert.equal(corrupted((c) => { c.evidenceUrl = "https://example.com/unrelated"; }), null);
assert.equal(corrupted((_, p) => { p.reviewedChange = "OK"; }), null);
assert.equal(corrupted((_, p) => { p.matchedOperations = []; }), null);
assert.equal(corrupted((c) => { c.resolutionKind = "prevention-guard"; }), null);
assert.equal(corrupted((_, p) => { p.scope = "full-flashloan-route-repair"; }), null);
console.log("PASS: general verified-case memory contract, exact-match guards and tamper negatives (synthetic fixtures only).");
