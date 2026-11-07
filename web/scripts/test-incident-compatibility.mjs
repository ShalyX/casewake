import assert from "node:assert/strict";
import { assessCase, fingerprintError } from "../src/lib/incidents.ts";

const packageAddress = "0000000000000000000000000000000000000000000000000000000000000002";
const sourceError = 'MoveAbort(MoveLocation { module: ModuleId { address: ' + packageAddress + ', name: Identifier("balance") }, function: 7, instruction: 10, function_name: Some("split") }, 2) in command 18';
const recurrenceError = 'MoveAbort(MoveLocation { module: ModuleId { address: ' + packageAddress + ', name: Identifier("balance") }, function: 9, instruction: 4, function_name: Some("split") }, 2) in command 10';
const differentAbort = 'MoveAbort(MoveLocation { module: ModuleId { address: ' + packageAddress + ', name: Identifier("balance") }, function: 9, instruction: 4, function_name: Some("split") }, 3) in command 10';

const sourceFingerprint = fingerprintError(sourceError);
assert.equal(sourceFingerprint, fingerprintError(recurrenceError), "command and bytecode instruction positions must not fragment the same Move abort class");
assert.notEqual(sourceFingerprint, fingerprintError(differentAbort), "different abort codes must remain incompatible");

assert.equal(
  fingerprintError("InsufficientCoinBalance in command 15", "splitCoins"),
  fingerprintError("InsufficientCoinBalance in command 4", "splitCoins"),
  "same insufficient-balance split failures should match across PTB command positions",
);
assert.notEqual(
  fingerprintError("InsufficientCoinBalance in command 15", "splitCoins"),
  fingerprintError("InsufficientCoinBalance in command 15", "moveCall"),
  "different failing command kinds must not collapse into one class",
);

const record = {
  id: "case-source",
  digest: "source-digest",
  network: "sui-mainnet",
  fingerprint: sourceFingerprint,
  errorText: sourceError,
  packageId: "0x" + packageAddress,
  sdkVersion: "2.40.0",
  resolutionKind: "onchain-successor",
  validatedEvidence: { scope: "human-reviewed-successor-transaction", reviewerConfirmedCausality: true },
  status: "human-verified",
  evidenceUrl: "https://example.com/verified-fix",
  diagnosis: "A reproducible balance split abort.",
  resolutionSteps: "Refresh the balance, calculate the exact available amount, and verify the corrected split.",
  reviewer: "reviewer",
  verifiedAt: "2026-11-07T00:00:00.000Z",
};
const observation = {
  digest: "recurrence-digest",
  network: "sui-mainnet",
  outcome: "failed",
  fingerprint: fingerprintError(recurrenceError),
  packageId: "0x" + packageAddress,
  errorText: recurrenceError,
};
const compatible = assessCase(observation, record, 1);
assert.equal(compatible.verdict, "eligible-for-review");
assert.equal(compatible.warnings.length, 2, "trace-position and manually scoped SDK-version caveats must remain visible");

assert.equal(
  assessCase({ ...observation, packageId: "0x" + "1".repeat(64) }, record, 1).verdict,
  "incompatible",
  "known package mismatches must remain blocked",
);
assert.equal(
  assessCase({ ...observation, digest: record.digest }, record, 1).verdict,
  "incompatible",
  "a source incident cannot recall itself",
);
assert.equal(
  assessCase({ ...observation, fingerprint: fingerprintError(differentAbort) }, record, 1).verdict,
  "incompatible",
  "different abort codes must not be treated as the same incident",
);
assert.equal(
  assessCase({ ...observation, outcome: "unknown" }, record, 1).verdict,
  "incompatible",
  "unknown transaction outcomes must never trigger resolution recall",
);

console.log("PASS: stable error classes, command-position tolerance, package mismatch, self-match, and unknown-outcome gates.");
