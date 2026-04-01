import { z } from "zod";

import { isRegisteredNameTaken } from "@/lib/data";

export const guestIdentitySchema = z.object({
  guestName: z.string().min(2).max(50),
  guestKey: z.string().min(8).max(120)
});

export async function ensureGuestNameAvailable(name: string) {
  const taken = await isRegisteredNameTaken(name);

  if (taken) {
    throw new Error("This name is already used by a registered account.");
  }
}
