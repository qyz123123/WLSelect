"use client";

import { createContext, ReactNode, useContext } from "react";

import { AppUser } from "@/lib/types";

const ViewerContext = createContext<AppUser | null>(null);

export function ViewerProvider({
  children,
  viewer
}: {
  children: ReactNode;
  viewer: AppUser | null;
}) {
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  return useContext(ViewerContext);
}
