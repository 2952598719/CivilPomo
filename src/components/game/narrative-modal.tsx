"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NarrativeModalProps {
  open: boolean;
  narrative: string;
  loading: boolean;
  onClose: () => void;
}

export function NarrativeModal({
  open,
  narrative,
  loading,
  onClose,
}: NarrativeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>进展</DialogTitle>
          <DialogDescription asChild>
            {loading ? (
              <p className="text-2xl tracking-widest text-muted-foreground animate-pulse">
                ···
              </p>
            ) : (
              <p className="text-base leading-relaxed text-foreground">
                {narrative}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        {!loading && (
          <Button onClick={onClose} className="mt-4 w-full">
            继续
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
