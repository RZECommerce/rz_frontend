import { Button } from "@/components/ui/button";
import * as React from "react";



export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  subtitleIcon?: React.ElementType;
  color?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  subtitleIcon: SubtitleIcon,
  color,
  className,
}: StatsCardProps) {
  return (
    <div
      className={`relative p-5 rounded-xl border bg-card overflow-hidden ${className || ""}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-black/5 to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-[26px] font-semibold tracking-tight">
            {value}
          </p>
          {subtitle && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {SubtitleIcon && (
                <SubtitleIcon className="size-5" />
              )}
              <span className="text-sm font-medium">{subtitle}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="icon" className="size-5">
          <Icon
            className="size-5"
            style={color ? { color } : undefined}
          />
        </Button>
      </div>
    </div>
  );
}

