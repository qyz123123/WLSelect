import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: {
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"section">) {
  return (
    <section className={cn("card-surface rounded-[28px] p-3", className)} {...props}>
      {children}
    </section>
  );
}
