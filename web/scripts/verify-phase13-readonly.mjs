/**
 * Read-only Phase 13 integration controls.
 * Uses real Tatum Mainnet lookups and verifies the reviewer gate rejects an
 * unapproved case. It never writes to Walrus, signs, or submits a transaction.
 * The failed/successful sample digests are status/auth fixtures only; they are
 * NOT the required representative non-DeFi human-reviewed product case.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = (process.env.CASEWAKE_BASE_URL || 'http://127.0.0.1:4218').replace(/\/$/, '');
function localSecret(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((value) => value.trim().startsWith(name + '='));
    if (!line) return '';
    return line.slice(line.indexOf('=') + 1).trim().replace(/^(["'])(.*)\1$/, '$2');
  } catch { return ''; }
}
async function post(path, body, key) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(key ? { 'x-workspace-key': key } : {}) },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text); } catch { data = { error: text }; }
  return { status: response.status, data };
}

const statusResponse = await fetch(base + '/api/status');
assert.equal(statusResponse.status, 200, 'status endpoint must be healthy');
const status = await statusResponse.json();
assert.equal(status.tatumConfigured, true, 'Tatum must be configured');
const reviewerKey = localSecret('WORKSPACE_WRITE_KEY');
console.log('PASS: live app status and Tatum configuration');

const failed = await post('/api/transaction', { digest: '6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v' }, reviewerKey);
assert.equal(failed.status, 200, 'failed control lookup should return 200');
assert.equal(failed.data.transaction?.outcome, 'failed');
assert.ok(Number.isFinite(failed.data.transaction?.transactionTimestampMs), 'failed tx chain timestamp must be present');
assert.match(String(failed.data.transaction?.checkpoint || ''), /^\d+$/, 'failed tx checkpoint must be present');
console.log('PASS: real Tatum Mainnet failed lookup includes timestamp and checkpoint');

const succeeded = await post('/api/transaction', { digest: 'DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv' }, reviewerKey);
assert.equal(succeeded.status, 200, 'successful control lookup should return 200');
assert.equal(succeeded.data.transaction?.outcome, 'succeeded');
assert.ok(Number.isFinite(succeeded.data.transaction?.transactionTimestampMs), 'successful tx chain timestamp must be present');
assert.match(String(succeeded.data.transaction?.checkpoint || ''), /^\d+$/, 'successful tx checkpoint must be present');
console.log('PASS: real Tatum Mainnet successful lookup includes timestamp and checkpoint');

const prunedDigest = '3AkKcrSrqPqD8JA2UBgecq3fES6Tm73v4aDHbdSnyUzt';
const pruned = await post('/api/transaction', { digest: prunedDigest }, reviewerKey);
assert.equal(pruned.status, 200, 'a valid digest not found by Tatum must be represented as unknown');
assert.equal(pruned.data.transaction?.outcome, 'unknown', 'NOT_FOUND must not be mislabeled as failed or succeeded');
assert.match(String(pruned.data.transaction?.outcomeReason || ''), /NOT_FOUND/i);
console.log('PASS: unavailable historical digest is explicitly classified as unknown');

const unknownRecall = await post('/api/recall', { digest: prunedDigest }, reviewerKey);
assert.equal(unknownRecall.status, 200, 'unknown outcome recall should return a safe empty result');
assert.equal(unknownRecall.data.transaction?.outcome, 'unknown');
assert.equal(unknownRecall.data.candidates?.length, 0);
assert.equal(unknownRecall.data.walrusHitsExamined, 0, 'unknown transactions must not trigger Walrus recall');
console.log('PASS: unknown transaction does not trigger resolution recall or a Walrus read');

const anonymous = await post('/api/remember', {});
assert.equal(anonymous.status, 403, 'anonymous resolution writes must be rejected');
console.log('PASS: anonymous resolution write rejected');

assert.ok(reviewerKey, 'local reviewer key is required for the no-approval gate test');
const unapproved = await post('/api/remember', {
  digest: '6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v',
  diagnosis: 'TEST ONLY: confirm the explicit reviewer approval gate.',
  resolutionSteps: 'TEST ONLY: no correction or Walrus write is authorized.',
  evidenceUrl: 'https://suivision.xyz/txblock/DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv',
  reviewer: 'Casewake QA (test only)',
  verified: true,
  resolutionKind: 'onchain-successor',
  successorDigest: 'DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv',
  reviewedChange: 'TEST ONLY: this is deliberately not a real reviewed engineering change.',
  confirmedCausalLink: false,
}, reviewerKey);
assert.equal(unapproved.status, 400, 'reviewer without causal approval must be rejected');
assert.match(String(unapproved.data.error || ''), /explicitly confirm/i);
console.log('PASS: authenticated reviewer without explicit causal approval rejected; no Walrus write attempted');

const unapprovedArtifact = await post('/api/remember', {
  digest: '6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v',
  diagnosis: 'TEST ONLY: the example failure is not being recorded as a real resolution.',
  resolutionSteps: 'TEST ONLY: no case-specific correction or Walrus write is authorized.',
  evidenceUrl: 'https://github.com/example/sui-app/pull/42',
  reviewer: 'Casewake QA (test only)',
  verified: true,
  resolutionKind: 'reviewed-evidence',
  verificationMethod: 'integration-test',
  reviewedChange: 'TEST ONLY: deliberately missing a real engineering change and causal approval.',
  confirmedCausalLink: false,
}, reviewerKey);
assert.equal(unapprovedArtifact.status, 400, 'reviewed-artifact method without causal approval must be rejected');
assert.match(String(unapprovedArtifact.data.error || ''), /explicitly confirm/i);
console.log('PASS: reviewed-artifact method also rejects missing human causal approval before fetching GitHub or writing Walrus');
console.log('PHASE13_READ_ONLY_CONTROLS=PASS (not the human-reviewed case acceptance gate)');
