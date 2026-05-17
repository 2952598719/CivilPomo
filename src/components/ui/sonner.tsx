"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        duration: 15000,
        classNames: {
          toast:
            "bg-background text-foreground border-border shadow-lg",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
