export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad =
      normalized.length % 4 === 0
        ? ''
        : '='.repeat(4 - (normalized.length % 4));
    const json = globalThis.atob(normalized + pad);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
