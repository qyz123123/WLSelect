"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { readLocalStorage, removeLocalStorage, writeLocalStorage } from "@/lib/browser-storage";
import { isGuestNameAllowed } from "@/lib/guest-name";
import { writeGuestIdentityCookie } from "@/lib/identity-cookie-client";
import { AppUser, IdentityState } from "@/lib/types";

const STORAGE_KEY = "wlselect-identity";

interface IdentityContextValue {
  identity: IdentityState;
  hydrated: boolean;
  selectTeacher: () => void;
  selectStudent: () => void;
  enableGuestPosting: (displayName: string) => void;
  clearIdentity: () => void;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

function createGuestKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function IdentityProvider({
  children,
  viewer
}: {
  children: ReactNode;
  viewer: AppUser | null;
}) {
  const [identity, setIdentity] = useState<IdentityState>({
    selectedRole: null,
    status: null
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (viewer?.role === "teacher") {
      setIdentity({
        selectedRole: "teacher",
        status: "teacher-logged-in"
      });
      setHydrated(true);
      return;
    }

    if (viewer?.role === "student") {
      setIdentity({
        selectedRole: "student",
        status: "student-logged-in"
      });
      setHydrated(true);
      return;
    }

    const stored = readLocalStorage(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as IdentityState;
        const guestDisplayName =
          parsed.guestDisplayName && isGuestNameAllowed(parsed.guestDisplayName)
            ? parsed.guestDisplayName
            : undefined;

        setIdentity({
          selectedRole: parsed.selectedRole ?? null,
          status:
            parsed.selectedRole === "student"
              ? guestDisplayName
                ? "student-guest"
                : "student-browser"
              : parsed.status ?? null,
          guestDisplayName,
          guestKey: guestDisplayName ? parsed.guestKey : undefined
        });
      } catch {
        removeLocalStorage(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, [viewer]);

  useEffect(() => {
    if (!hydrated || viewer) {
      writeGuestIdentityCookie(undefined);
      return;
    }

    if (!identity.selectedRole) {
      writeGuestIdentityCookie(undefined);
      removeLocalStorage(STORAGE_KEY);
      return;
    }

    writeGuestIdentityCookie(identity.selectedRole === "student" ? identity.guestKey : undefined);
    writeLocalStorage(STORAGE_KEY, JSON.stringify(identity));
  }, [hydrated, identity, viewer]);

  const selectTeacher = useCallback(
    () =>
      setIdentity({
        selectedRole: "teacher",
        status: "teacher-auth-required"
      }),
    []
  );

  const selectStudent = useCallback(
    () =>
      setIdentity((current) => ({
        selectedRole: "student",
        status: current.guestDisplayName ? "student-guest" : "student-browser",
        guestDisplayName: current.guestDisplayName,
        guestKey: current.guestKey
      })),
    []
  );

  const enableGuestPosting = useCallback(
    (displayName: string) =>
      setIdentity((current) => ({
        selectedRole: "student",
        status: "student-guest",
        guestDisplayName: displayName,
        guestKey: current.guestKey ?? createGuestKey()
      })),
    []
  );

  const clearIdentity = useCallback(() => {
    removeLocalStorage(STORAGE_KEY);
    setIdentity({
      selectedRole: null,
      status: null
    });
  }, []);

  const value = useMemo<IdentityContextValue>(
    () => ({
      identity,
      hydrated,
      selectTeacher,
      selectStudent,
      enableGuestPosting,
      clearIdentity
    }),
    [clearIdentity, enableGuestPosting, hydrated, identity, selectStudent, selectTeacher]
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity() {
  const context = useContext(IdentityContext);

  if (!context) {
    throw new Error("useIdentity must be used within IdentityProvider.");
  }

  return context;
}
