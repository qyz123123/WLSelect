import { cookies } from "next/headers";

const IDENTITY_COOKIE = "wlselect-guest";

interface GuestIdentityCookie {
  guestKey?: string;
}

function parseGuestIdentityCookieValue(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as GuestIdentityCookie;
  } catch {
    return null;
  }
}

export async function readGuestKeyFromCookie() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(IDENTITY_COOKIE)?.value;
  const parsed = parseGuestIdentityCookieValue(raw);

  if (!parsed?.guestKey || typeof parsed.guestKey !== "string") {
    return undefined;
  }

  return parsed.guestKey;
}
