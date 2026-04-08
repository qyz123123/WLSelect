"use client";

export function createClientId(prefix: string) {
  const cryptoObject = globalThis.crypto;
  const randomUUID = typeof cryptoObject?.randomUUID === "function" ? cryptoObject.randomUUID.bind(cryptoObject) : undefined;

  if (randomUUID) {
    try {
      return randomUUID();
    } catch {
      // Fall back when the runtime exposes a partial or incompatible crypto implementation.
    }
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
