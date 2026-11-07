/** Preserve engineering text while rejecting credentials before durable storage. */
export function assertSafeMemoryContent(fields: Record<string, string | null>) {
  const secrets = [
    /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/i,
    /\bsuiprivkey1[a-z0-9]+/i,
    /\b(?:sk-proj-|sk-ant-|gh[pousr]_|github_pat_)[a-zA-Z0-9_-]{12,}/,
    /\bBearer\s+[a-zA-Z0-9_.-]{16,}/i,
    /\b(?:private[_ -]?key|api[_ -]?key|access[_ -]?token|secret[_ -]?key|mnemonic|seed[_ -]?phrase)\s*[:=]\s*["']?[^\s"']{12,}/i,
    /\b(?:mnemonic|seed[_ -]?phrase)\s*[:=]\s*(?:[a-z]+\s+){11}[a-z]+/i,
  ];
  for (const [name, value] of Object.entries(fields)) {
    if (value && secrets.some(pattern => pattern.test(value)))
      throw new Error(`Remove credentials or private key material from ${name} before storing this case.`);
  }
}
