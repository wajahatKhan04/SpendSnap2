import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
      <Loader2 className={cn("h-5 w-5 animate-spin text-primary", className)} />
    </div>
  );
}
