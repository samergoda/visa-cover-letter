import React from "react";

export function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground min-h-[20px]">
        {value === null || value === undefined || value === "" ? (
          <span className="italic text-muted-foreground/45 font-normal">—</span>
        ) : (
          value
        )}
      </span>
    </div>
  );
}
