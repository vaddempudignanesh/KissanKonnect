// app/loading.tsx
// PURPOSE: Global loading skeleton shown during route transitions.
import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="p-4 rounded-2xl bg-[var(--kk-green)] text-[var(--kk-lime)] animate-pulse">
        <Leaf className="w-8 h-8" />
      </div>
      <div className="text-sm text-[var(--kk-text-dim)] animate-pulse">
        Loading…
      </div>
    </div>
  );
}