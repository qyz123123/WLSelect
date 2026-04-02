const IDENTITY_COOKIE = "wlselect-guest";

export function writeGuestIdentityCookie(guestKey?: string) {
  if (typeof document === "undefined") {
    return;
  }

  if (!guestKey) {
    document.cookie = `${IDENTITY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  const payload = encodeURIComponent(JSON.stringify({ guestKey }));
  document.cookie = `${IDENTITY_COOKIE}=${payload}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
