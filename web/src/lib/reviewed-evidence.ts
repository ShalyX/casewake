import "server-only";
import { createHash } from "node:crypto";
import type { ObservedTransaction } from "./incidents";
import type { VerificationMethod } from "./guard-evidence";

type GitHubArtifact =
  | { kind: "pull"; owner: string; repo: string; number: number; canonicalUrl: string; apiUrl: string }
  | { kind: "commit"; owner: string; repo: string; sha: string; canonicalUrl: string; apiUrl: string };

type Fetcher = typeof fetch;

export function parseGitHubArtifactUrl(value: string): GitHubArtifact {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Use a public GitHub merged pull request or full 40-character commit URL as case-specific proof."); }
  if (url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password ||
      url.search || url.hash || url.port) {
    throw new Error("Reviewed evidence must be a canonical public HTTPS GitHub pull request or commit URL.");
  }
  const pull = url.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);
  if (pull) {
    const [, owner, repo, rawNumber] = pull;
    const number = Number(rawNumber);
    if (!Number.isSafeInteger(number) || number < 1) throw new Error("GitHub pull request number is invalid.");
    const canonicalUrl = `https://github.com/${owner}/${repo}/pull/${number}`;
    return { kind: "pull", owner, repo, number, canonicalUrl,
      apiUrl: `https://api.github.com/repos/${owner}/${repo}/pulls/${number}` };
  }
  const commit = url.pathname.match(/^\/([^/]+)\/([^/]+)\/commit\/([a-f0-9]{40})\/?$/i);
  if (commit) {
    const [, owner, repo, rawSha] = commit;
    const sha = rawSha.toLowerCase();
    const canonicalUrl = `https://github.com/${owner}/${repo}/commit/${sha}`;
    return { kind: "commit", owner, repo, sha, canonicalUrl,
      apiUrl: `https://api.github.com/repos/${owner}/${repo}/commits/${sha}` };
  }
  throw new Error("Evidence must be a public GitHub merged pull request or immutable full commit URL; arbitrary docs, issues and explorer links are not accepted as a verified fix artifact.");
}

async function getJson(fetcher: Fetcher, url: string): Promise<Record<string, unknown>> {
  const response = await fetcher(url, {
    method: "GET",
    cache: "no-store",
    redirect: "error",
    headers: { accept: "application/vnd.github+json", "user-agent": "Casewake-Reviewed-Evidence/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`GitHub evidence could not be independently retrieved (HTTP ${response.status}).`);
  const body = await response.json() as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("GitHub returned an invalid evidence artifact.");
  return body as Record<string, unknown>;
}

function snapshotFiles(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100)
    throw new Error("The GitHub artifact must expose between 1 and 100 changed files. Link a specific commit if the pull request is larger.");
  return value.map((item) => {
    if (!item || typeof item !== "object") throw new Error("GitHub returned an invalid changed-file entry.");
    const file = item as Record<string, unknown>;
    if (typeof file.filename !== "string" || typeof file.status !== "string")
      throw new Error("GitHub changed-file metadata is incomplete.");
    return {
      filename: file.filename,
      status: file.status,
      additions: Number(file.additions || 0),
      deletions: Number(file.deletions || 0),
      changes: Number(file.changes || 0),
      patch: typeof file.patch === "string" ? file.patch : null,
    };
  });
}

export async function verifyReviewedEvidence(
  original: ObservedTransaction,
  evidenceUrl: string,
  reviewedChange: string,
  verificationMethod: string,
  confirmedCausalLink: boolean,
  fetcher: Fetcher = fetch,
) {
  if (original.network !== "sui-mainnet" || original.source !== "Tatum Sui gRPC" ||
      original.outcome !== "failed" || !original.errorText || !original.fingerprint)
    throw new Error("Only a Tatum-confirmed failed Sui Mainnet execution can receive a reviewed resolution.");
  if (!Number.isFinite(original.transactionTimestampMs) || !original.checkpoint || !/^\d+$/.test(original.checkpoint))
    throw new Error("Tatum must provide the original failure's chain timestamp and checkpoint before evidence can be approved.");
  if (!confirmedCausalLink)
    throw new Error("An authorized human reviewer must explicitly confirm that this evidence resolves this specific incident.");
  if (reviewedChange.trim().length < 30)
    throw new Error("Describe the exact case-specific engineering change (at least 30 characters).");
  const methods: VerificationMethod[] = [
    "reproduction-test", "unit-test", "integration-test", "deployed-fix", "maintainer-confirmed-fix",
  ];
  if (!methods.includes(verificationMethod as VerificationMethod))
    throw new Error("Select a specific verification method: reproduction, unit test, integration test, deployed fix or maintainer-confirmed fix.");

  const artifact = parseGitHubArtifactUrl(evidenceUrl);
  if (evidenceUrl !== artifact.canonicalUrl)
    throw new Error("Use the canonical GitHub evidence URL without query strings or trailing slashes.");
  const detail = await getJson(fetcher, artifact.apiUrl);
  let title = "";
  let body = "";
  let commitSha = "";
  let files: ReturnType<typeof snapshotFiles>;
  let metadata: Record<string, unknown>;

  if (artifact.kind === "pull") {
    if (detail.state !== "closed" || typeof detail.merged_at !== "string" || !detail.merged_at)
      throw new Error("A pull request is acceptable only after GitHub confirms it was merged. Use the immutable commit URL if the fix is represented by a specific commit.");
    title = typeof detail.title === "string" ? detail.title : "";
    body = typeof detail.body === "string" ? detail.body : "";
    commitSha = typeof detail.merge_commit_sha === "string" ? detail.merge_commit_sha : "";
    if (!/^[a-f0-9]{40}$/i.test(commitSha))
      throw new Error("GitHub did not return the merged commit SHA for this pull request.");
    const filesResponse = await fetcher(artifact.apiUrl + "/files?per_page=100", {
      method: "GET", cache: "no-store", redirect: "error",
      headers: { accept: "application/vnd.github+json", "user-agent": "Casewake-Reviewed-Evidence/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!filesResponse.ok) throw new Error(`GitHub pull request changed files could not be retrieved (HTTP ${filesResponse.status}).`);
    files = snapshotFiles(await filesResponse.json());
    metadata = {
      kind: "merged-pull-request", url: artifact.canonicalUrl, apiUrl: artifact.apiUrl,
      title, body, state: detail.state, mergedAt: detail.merged_at,
      headSha: (detail.head as Record<string, unknown> | undefined)?.sha || null,
      mergeCommitSha: commitSha, changedFiles: detail.changed_files,
    };
  } else {
    title = typeof (detail.commit as Record<string, unknown> | undefined)?.message === "string"
      ? String((detail.commit as Record<string, unknown>).message).split("\n")[0] : "";
    body = typeof (detail.commit as Record<string, unknown> | undefined)?.message === "string"
      ? String((detail.commit as Record<string, unknown>).message) : "";
    commitSha = typeof detail.sha === "string" ? detail.sha : "";
    if (commitSha.toLowerCase() !== artifact.sha)
      throw new Error("GitHub returned a different commit than the immutable URL requested.");
    files = snapshotFiles(detail.files);
    metadata = {
      kind: "commit", url: artifact.canonicalUrl, apiUrl: artifact.apiUrl,
      title, message: body, commitSha,
      author: (detail.author as Record<string, unknown> | undefined)?.login || null,
    };
  }

  if (!title.trim() || !commitSha || files.length === 0)
    throw new Error("The GitHub artifact has no inspectable title, immutable commit or changed-file evidence.");
  const snapshot = { metadata, files };
  const evidenceSha256 = createHash("sha256").update(JSON.stringify(snapshot), "utf8").digest("hex");
  return {
    schema: "casewake-validated-evidence/v1" as const,
    scope: "human-reviewed-engineering-artifact" as const,
    proofType: "reviewer-attested-github-artifact" as const,
    originalDigest: original.digest,
    originalTimestampMs: original.transactionTimestampMs!,
    originalCheckpoint: original.checkpoint!,
    provider: "GitHub public API" as const,
    evidenceUrl: artifact.canonicalUrl,
    evidenceApiUrl: artifact.apiUrl,
    evidenceTitle: title.trim().slice(0, 300),
    evidenceCommitSha: commitSha.toLowerCase(),
    evidenceFileCount: files.length,
    evidenceSha256,
    verificationMethod: verificationMethod as VerificationMethod,
    reviewerConfirmedCausality: true as const,
    reviewedChange: reviewedChange.trim().slice(0, 1000),
    verifiedAt: new Date().toISOString(),
    originalHistoricalRouteRepaired: false as const,
  };
}
