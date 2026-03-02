import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { salaryComponentTypeService } from "@/services/payroll.service";
import type { SalaryComponentTypeData } from "@/types/payroll";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ViewComponentTypeModal } from "./view-component-type-modal";

interface ComponentTypesTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
  isDeleting?: boolean;
}

export function ComponentTypesTable({
  onEdit,
  onDelete,
  onAddClick,
  isDeleting = false,
}: ComponentTypesTableProps) {
  const [viewingTypeId, setViewingTypeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: typesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["salaryComponentTypes"],
    queryFn: () => salaryComponentTypeService.getAll(),
  });

  const types = typesData || [];

  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return types;

    const query = searchQuery.toLowerCase();
    return types.filter((type: SalaryComponentTypeData) => {
      return (
        type.code?.toLowerCase().includes(query) ||
        type.name?.toLowerCase().includes(query) ||
        type.category?.toLowerCase().includes(query) ||
        type.description?.toLowerCase().includes(query)
      );
    });
  }, [types, searchQuery]);

  return (
    <div className="space-y-4">
      {onAddClick && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Component Types</h2>
            <p className="text-sm text-muted-foreground">
              Define salary component types (allowances, bonuses, etc.)
            </p>
          </div>
          <Button onClick={onAddClick} className="gap-2">
            <EditIcon className="size-5" />
            Add Component Type
          </Button>
        </div>
      )}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by code, name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                  Code
                </TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground font-medium">
                  Name
                </TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                  Category
                </TableHead>
                <TableHead className="min-w-[140px] text-muted-foreground font-medium">
                  Calculation Type
                </TableHead>
                <TableHead className="min-w-[250px] text-muted-foreground font-medium">
                  Description
                </TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                  Tax Status
                </TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                  Status
                </TableHead>
                <TableHead className="text-right min-w-[120px] text-muted-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Loading component types...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Failed to load component types{error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              ) : filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchQuery ? "No component types match your search." : "No component types found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((type: SalaryComponentTypeData) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {type.code}
                    </TableCell>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <span className="capitalize inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-muted">
                        {type.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                        {type.calculation_type.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                      <div className="line-clamp-2" title={type.description || undefined}>
                        {type.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                          type.is_taxable
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                        )}
                      >
                        {type.is_taxable ? "Taxable" : "Tax-Free"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium",
                          type.is_active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                        )}
                      >
                        {type.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingTypeId(type.id)}
                          title="View Details"
                        >
                          <ViewIcon className="size-5 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(type.id)}
                          title="Edit"
                        >
                          <EditIcon className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(type.id)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          <DeleteIcon className="size-5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {viewingTypeId && (
        <ViewComponentTypeModal
          typeId={viewingTypeId}
          open={!!viewingTypeId}
          onOpenChange={(open) => !open && setViewingTypeId(null)}
        />
      )}
    </div>
  );
}
