import test from "node:test";
import assert from "node:assert/strict";
import { verifyReviewedEvidence, parseGitHubArtifactUrl } from "../src/lib/reviewed-evidence.ts";
import { encodeMemory, decodeMemory, assessCase } from "../src/lib/incidents.ts";

const sha = "a".repeat(40);
const sourceDigest = "4".repeat(43);
const original = {
  digest: sourceDigest,
  network: "sui-mainnet",
  source: "Tatum Sui gRPC",
  observedAt: "2026-11-04T00:20:16.746Z",
  transactionTimestampMs: 1793751616746,
  checkpoint: "342629269",
  outcome: "failed",
  errorText: "MoveAbort in 0x123::settlement::settle code 7",
  fingerprint: "moveabort in 0x123::settlement::settle code 7",
  packageId: "0x123",
};
const change = "Corrected the settlement argument validation and added a regression check for the missing state transition.";
const prUrl = "https://github.com/example/sui-app/pull/42";
const prDetail = {
  state: "closed",
  merged_at: "2026-11-06T10:00:00Z",
  title: "Fix settlement argument validation",
  body: "Fixes the failed settlement call and adds regression coverage.",
  merge_commit_sha: sha,
  head: { sha: "b".repeat(40) },
  changed_files: 1,
};
const prFiles = [{
  filename: "sources/settlement.move", status: "modified",
  additions: 8, deletions: 3, changes: 11,
  patch: "@@ -1,2 +1,7 @@\n+assert!(state.is_ready(), E_NOT_READY);",
}];
function mockPull(fetchCalls = []) {
  return async (input) => {
    const url = String(input);
    fetchCalls.push(url);
    if (url.endsWith("/pulls/42")) return new Response(JSON.stringify(prDetail), { status: 200 });
    if (url.endsWith("/pulls/42/files?per_page=100")) return new Response(JSON.stringify(prFiles), { status: 200 });
    throw new Error("Unexpected evidence fetch: " + url);
  };
}
const fetchCommit = async (input) => {
  const url = String(input);
  assert.ok(url.endsWith("/commits/" + sha));
  return new Response(JSON.stringify({
    sha,
    commit: { message: "Fix Sui settlement argument validation\n\nAdd a regression guard." },
    files: prFiles,
  }), { status: 200 });
};

test("only canonical public GitHub merged PRs and full immutable commit URLs parse", () => {
  assert.equal(parseGitHubArtifactUrl(prUrl).apiUrl, "https://api.github.com/repos/example/sui-app/pulls/42");
  assert.equal(parseGitHubArtifactUrl("https://github.com/example/sui-app/commit/" + sha).kind, "commit");
  for (const url of [
    "http://github.com/example/sui-app/pull/42",
    "https://github.com/example/sui-app/issues/42",
    "https://example.com/fix",
    "https://github.com/example/sui-app/commit/shortsha",
    "https://github.com/example/sui-app/pull/42?tab=files",
  ]) assert.throws(() => parseGitHubArtifactUrl(url));
});

test("a merged PR is fetched with its changed-file diff and fingerprinted", async () => {
  const calls = [];
  const proof = await verifyReviewedEvidence(original, prUrl, change, "integration-test", true, mockPull(calls));
  assert.equal(proof.scope, "human-reviewed-engineering-artifact");
  assert.equal(proof.proofType, "reviewer-attested-github-artifact");
  assert.equal(proof.originalDigest, sourceDigest);
  assert.equal(proof.originalCheckpoint, "342629269");
  assert.equal(proof.evidenceCommitSha, sha);
  assert.equal(proof.evidenceFileCount, 1);
  assert.match(proof.evidenceSha256, /^[a-f0-9]{64}$/);
  assert.equal(proof.reviewerConfirmedCausality, true);
  assert.equal(proof.verificationMethod, "integration-test");
  assert.deepEqual(calls, [
    "https://api.github.com/repos/example/sui-app/pulls/42",
    "https://api.github.com/repos/example/sui-app/pulls/42/files?per_page=100",
  ]);
});

test("a full immutable commit URL is accepted when GitHub exposes changed files", async () => {
  const proof = await verifyReviewedEvidence(
    original, "https://github.com/example/sui-app/commit/" + sha, change, "unit-test", true, fetchCommit,
  );
  assert.equal(proof.evidenceCommitSha, sha);
  assert.equal(proof.verificationMethod, "unit-test");
  assert.equal(proof.evidenceFileCount, 1);
});

test("unmerged pull requests cannot be treated as verified fix artifacts", async () => {
  const fetcher = async () => new Response(JSON.stringify({ ...prDetail, merged_at: null }), { status: 200 });
  await assert.rejects(
    verifyReviewedEvidence(original, prUrl, change, "integration-test", true, fetcher),
    /only after GitHub confirms it was merged/,
  );
});

test("missing diff, missing human attestation and incomplete chain provenance fail closed", async () => {
  const noFiles = async (input) => String(input).endsWith("/pulls/42")
    ? new Response(JSON.stringify(prDetail), { status: 200 })
    : new Response(JSON.stringify([]), { status: 200 });
  await assert.rejects(verifyReviewedEvidence(original, prUrl, change, "integration-test", true, noFiles), /changed files/);
  await assert.rejects(verifyReviewedEvidence(original, prUrl, change, "integration-test", false, mockPull()), /explicitly confirm/);
  await assert.rejects(verifyReviewedEvidence({ ...original, checkpoint: null }, prUrl, change, "integration-test", true, mockPull()), /timestamp and checkpoint/);
  await assert.rejects(verifyReviewedEvidence(original, prUrl, "too short", "integration-test", true, mockPull()), /at least 30/);
  await assert.rejects(verifyReviewedEvidence(original, prUrl, change, "unknown-method", true, mockPull()), /Select a specific verification method/);
});

test("reviewed engineering evidence is eligible only as a distinct compatible human-reviewed memory", async () => {
  const proof = await verifyReviewedEvidence(original, prUrl, change, "integration-test", true, mockPull());
  const record = {
    schema: "incident-memory/v1",
    id: "reviewed-evidence-fixture",
    digest: sourceDigest,
    network: "sui-mainnet",
    fingerprint: original.fingerprint,
    errorText: original.errorText,
    packageId: original.packageId,
    sdkVersion: null,
    diagnosis: "The settlement call used a state transition that was not valid for this object.",
    resolutionSteps: "Apply the guarded transition and rerun the settlement integration test before deploying.",
    evidenceUrl: proof.evidenceUrl,
    reviewer: "casewake-maintainer",
    verifiedAt: proof.verifiedAt,
    status: "human-verified",
    resolutionKind: "reviewed-evidence",
    validatedEvidence: proof,
  };
  const decoded = decodeMemory(encodeMemory(record));
  assert.equal(decoded?.resolutionKind, "reviewed-evidence");
  const nextFailure = { ...original, digest: "5".repeat(43), checkpoint: "342629300", transactionTimestampMs: 1793751716746 };
  assert.equal(assessCase(nextFailure, decoded, 0.1).verdict, "eligible-for-review");
  assert.equal(assessCase({ ...nextFailure, digest: sourceDigest }, decoded, 0.1).verdict, "incompatible");
  const badHash = { ...record, validatedEvidence: { ...proof, evidenceSha256: "not-a-hash" } };
  assert.equal(decodeMemory(encodeMemory(badHash)), null);
  const badCausality = { ...record, validatedEvidence: { ...proof, reviewerConfirmedCausality: false } };
  assert.equal(decodeMemory(encodeMemory(badCausality)), null);
  const badLink = { ...record, evidenceUrl: "https://example.com/unrelated" };
  assert.equal(decodeMemory(encodeMemory(badLink)), null);
});
