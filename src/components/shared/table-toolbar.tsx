import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import * as React from "react";

export interface TableToolbarProps {
  title?: string;
  titleIcon?: React.ElementType;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  hasActiveFilters?: boolean;
  filterContent?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function TableToolbar({
  title,
  titleIcon: TitleIcon,
  searchPlaceholder = "Search Anything...",
  searchValue = "",
  onSearchChange,
  showSearch = true,
  showFilter = true,
  hasActiveFilters = false,
  filterContent,
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b",
        className,
      )}
    >
      {(title || TitleIcon) && (
        <div className="flex items-center gap-2">
          {TitleIcon && <TitleIcon className="size-5 text-muted-foreground" />}
          {title && (
            <span className="font-medium text-muted-foreground">{title}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative flex-1 sm:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>
        )}

        {showFilter && filterContent && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-sm font-medium",
                "border-border hover:bg-background bg-muted shadow-xs",
              )}
            >
              <FilterIcon className="size-5" />
              Filter
              {hasActiveFilters && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {filterContent}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {actions}
      </div>
    </div>
  );
}
