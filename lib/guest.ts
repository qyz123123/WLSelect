import { z } from "zod";

import { isRegisteredNameTaken } from "@/lib/data";
import { isGuestNameAllowed } from "@/lib/guest-name";

export const guestIdentitySchema = z.object({
  guestName: z.string().min(2).max(50),
  guestKey: z.string().min(8).max(120)
});

export async function ensureGuestNameAvailable(name: string) {
  if (!isGuestNameAllowed(name)) {
    throw new Error("This guest name is not allowed.");
  }

  const taken = await isRegisteredNameTaken(name);

  if (taken) {
    throw new Error("This name is already used by a registered account.");
  }
}
