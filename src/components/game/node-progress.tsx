import { Progress } from "@/components/ui/progress";

interface NodeProgressProps {
  current: number;
  total: number;
}

export function NodeProgress({ current, total }: NodeProgressProps) {
  const percent = (current / total) * 100;
  return (
    <div className="mt-2 flex items-center gap-2">
      <Progress value={percent} className="h-2 w-48" />
      <span className="text-sm text-muted-foreground">
        {current}/{total}
      </span>
    </div>
  );
}
