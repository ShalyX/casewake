export function isTatumNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: unknown; message?: unknown };
  return value.code === "NOT_FOUND" || /transaction .+ not found/i.test(String(value.message || ""));
}
