import Link from "next/link";

import { Card } from "@/components/card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          The requested teacher, course, or page could not be found in this demo workspace.
        </p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
          Back home
        </Link>
      </Card>
    </div>
  );
}
