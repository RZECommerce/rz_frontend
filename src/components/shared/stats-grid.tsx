import * as React from "react";
import { StatsCard, type StatsCardProps } from "./stats-card";
import { Skeleton } from "@/components/ui/skeleton";

export interface StatsGridProps {
  stats: StatsCardProps[];
  isLoading?: boolean;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function StatsGrid({
  stats,
  isLoading = false,
  columns = 3,
  className,
}: StatsGridProps) {
  // If className includes grid-cols, use it but ensure we have base grid class and gaps
  const gridClasses = className?.includes("grid-cols")
    ? `grid ${className} gap-4 sm:gap-6`
    : `grid ${gridColsMap[columns]} gap-4 sm:gap-6 ${className || ""}`;

  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: stats.length || columns }).map((_, i) => (
          <div
            key={i}
            className="relative p-5 rounded-xl border bg-card animate-pulse h-[120px]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {stats.map((stat, index) => (
        <StatsCard key={stat.title || index} {...stat} />
      ))}
    </div>
  );
}

