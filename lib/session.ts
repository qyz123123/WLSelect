import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/data";

export async function getOptionalViewer() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return getCurrentUser(session.user.id);
}

export async function requireViewer() {
  const viewer = await getOptionalViewer();

  if (!viewer) {
    redirect("/login");
  }

  return viewer;
}
