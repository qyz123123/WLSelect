const blockedGuestNamePatterns = [/\bfuck\b/i, /\bshit\b/i, /\bbitch\b/i, /\basshole\b/i];

export function isGuestNameAllowed(name: string) {
  const normalized = name.trim();

  if (!normalized) {
    return false;
  }

  return !blockedGuestNamePatterns.some((pattern) => pattern.test(normalized));
}
