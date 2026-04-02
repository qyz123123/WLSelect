"use client";

import { createContext, ReactNode, useContext } from "react";

import { AppUser, Course, NotificationItem, TeacherProfile } from "@/lib/types";

interface ShellDataContextValue {
  viewer: AppUser | null;
  teachers: TeacherProfile[];
  courses: Course[];
  notifications: NotificationItem[];
}

const ShellDataContext = createContext<ShellDataContextValue | null>(null);

export function ShellDataProvider({
  children,
  viewer,
  teachers,
  courses,
  notifications
}: ShellDataContextValue & { children: ReactNode }) {
  return (
    <ShellDataContext.Provider
      value={{
        viewer,
        teachers,
        courses,
        notifications
      }}
    >
      {children}
    </ShellDataContext.Provider>
  );
}

export function useShellData() {
  const context = useContext(ShellDataContext);

  if (!context) {
    throw new Error("useShellData must be used within ShellDataProvider.");
  }

  return context;
}
