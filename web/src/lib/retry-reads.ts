/** Retry only transient read-only network calls. Do NOT use for Mainnet writes. */
export function isTransientReadError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; status?: unknown; message?: unknown; cause?: unknown; response?: { status?: unknown } };
  const code = String(e.code ?? "");
  const status = Number(e.status ?? e.response?.status ?? 0);
  if ([4, 14, 429, 500, 502, 503, 504].includes(status)) return true;
  if (["4", "14", "EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ENETUNREACH", "EHOSTUNREACH", "ECONNABORTED", "UNAVAILABLE", "DEADLINE_EXCEEDED"].includes(code)) return true;
  if (typeof e.message === "string" && /(?:EAI_AGAIN|ECONNRESET|ETIMEDOUT|UNAVAILABLE|DEADLINE_EXCEEDED|fetch failed|timed out|connection reset)/i.test(e.message)) return true;
  if (e.cause && e.cause !== error) return isTransientReadError(e.cause);
  return false;
}

export async function retryReadOnly<T>(
  action: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = Math.max(1, Math.min(3, options.attempts ?? 2));
  const delayMs = options.delayMs ?? 650;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt === attempts || !isTransientReadError(error)) throw error;
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error("Unreachable read retry state.");
}
