"use client";

import { useEffect, useState } from "react";

export function useApiData<T>(url: string, options?: { enabled?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          cache: "no-store"
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Request failed.");
        }

        const payload = (await response.json()) as T;

        if (active) {
          setData(payload);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Unexpected error.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [enabled, url]);

  return { data, loading, error, setData };
}
