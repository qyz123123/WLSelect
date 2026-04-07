"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "wlselect-visitor-key";

export function ViewTracker({ viewerId }: { viewerId: string | null }) {
  const pathname = usePathname();

  useEffect(() => {
    let visitorKey = viewerId;

    if (!visitorKey) {
      visitorKey = window.localStorage.getItem(STORAGE_KEY);
      if (!visitorKey) {
        visitorKey = crypto.randomUUID();
        window.localStorage.setItem(STORAGE_KEY, visitorKey);
      }
    }

    void fetch("/api/analytics/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        visitorKey,
        path: pathname
      })
    }).catch(() => undefined);
  }, [pathname, viewerId]);

  return null;
}
