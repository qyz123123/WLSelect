"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { readLocalStorage, writeLocalStorage } from "@/lib/browser-storage";

const STORAGE_KEY = "wlselect-visitor-key";

export function ViewTracker({ viewerId }: { viewerId: string | null }) {
  const pathname = usePathname();

  useEffect(() => {
    let visitorKey = viewerId;

    if (!visitorKey) {
      visitorKey = readLocalStorage(STORAGE_KEY);
      if (!visitorKey) {
        visitorKey =
          typeof globalThis.crypto?.randomUUID === "function"
            ? globalThis.crypto.randomUUID()
            : `viewer-${Math.random().toString(36).slice(2)}-${Date.now()}`;
        writeLocalStorage(STORAGE_KEY, visitorKey);
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
