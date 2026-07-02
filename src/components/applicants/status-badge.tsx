"use client";

import type { VisaStatus } from "@/types";

interface StatusBadgeProps {
  status?: VisaStatus | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground ${className ?? ""}`}
      >
        No Status
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${className ?? ""}`}
      style={{ backgroundColor: status.color }}
    >
      {status.name}
    </span>
  );
}
