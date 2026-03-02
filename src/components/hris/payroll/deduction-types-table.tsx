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
import { deductionTypeService } from "@/services/payroll.service";
import type { DeductionTypeData } from "@/types/payroll";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

interface DeductionTypesTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
  isDeleting?: boolean;
}

export function DeductionTypesTable({
  onEdit,
  onDelete,
  onAddClick,
  isDeleting = false,
}: DeductionTypesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: typesData, isLoading, isError } = useQuery({
    queryKey: ["deductionTypes"],
    queryFn: () => deductionTypeService.getAll(),
  });

  const types = typesData || [];

  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return types;

    const query = searchQuery.toLowerCase();
    return types.filter((type: DeductionTypeData) => {
      return (
        type.code?.toLowerCase().includes(query) ||
        type.name?.toLowerCase().includes(query) ||
        type.category?.toLowerCase().includes(query) ||
        type.description?.toLowerCase().includes(query)
      );
    });
  }, [types, searchQuery]);

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "loan":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "advance":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "insurance":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800";
      case "penalty":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const getCalculationTypeBadge = (type: string) => {
    switch (type) {
      case "fixed":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400";
      case "percentage":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400";
      case "installment":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Deduction Types</h2>
          <p className="text-sm text-muted-foreground">
            Manage master list of deduction types
          </p>
        </div>
        {onAddClick && (
          <Button onClick={onAddClick} className="gap-2">
            <AddIcon className="size-5" />
            Add Deduction Type
          </Button>
        )}
      </div>

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
                <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                  Code
                </TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground font-medium">
                  Name
                </TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                  Category
                </TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                  Calculation Type
                </TableHead>
                <TableHead className="min-w-[100px] text-center text-muted-foreground font-medium">
                  Recurring
                </TableHead>
                <TableHead className="min-w-[250px] text-muted-foreground font-medium">
                  Description
                </TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                  Status
                </TableHead>
                <TableHead className="text-right min-w-[150px] text-muted-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading deduction types...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-destructive"
                  >
                    Failed to load deduction types. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchQuery ? "No deduction types match your search." : "No deduction types found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((type: DeductionTypeData) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {type.code}
                    </TableCell>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium capitalize",
                          getCategoryBadgeColor(type.category)
                        )}
                      >
                        {type.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                          getCalculationTypeBadge(type.calculation_type)
                        )}
                      >
                        {type.calculation_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                          type.is_recurring
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                        )}
                      >
                        {type.is_recurring ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {type.description || "-"}
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
    </div>
  );
}
