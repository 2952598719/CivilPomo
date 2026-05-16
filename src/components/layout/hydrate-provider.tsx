"use client";

import { useHydrateFromServer } from "@/lib/hydrate";

export function HydrateProvider({ children }: { children: React.ReactNode }) {
  useHydrateFromServer();
  return <>{children}</>;
}
