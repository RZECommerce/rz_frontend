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
import { promotionService } from "@/services/core-hr.service";
import type { CoreHrFilters, Promotion } from "@/types/core-hr";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  Edit as Edit01Icon,
  Search as Search01Icon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";

interface PromotionsTableProps {
  filters: CoreHrFilters;
  onFiltersChange: (filters: CoreHrFilters) => void;
  onAdd: () => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function PromotionsTable({
  filters,
  onFiltersChange,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false,
}: PromotionsTableProps) {
  const [search, setSearch] = React.useState(filters.search || "");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["promotions", filters],
    queryFn: () => promotionService.getAll(filters),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const promotions = data?.data || [];

  if (isError) {
    console.error("Error loading promotions:", error);
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  return (
    <div className="rounded-xl bg-card overflow-hidden border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Promotions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search01Icon
              className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
            />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>
          <Button onClick={onAdd} size="sm">
            <Add01Icon className="size-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Promotion Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">
                  Error loading data. Please check your connection or try again later.
                </TableCell>
              </TableRow>
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No promotions found
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    {promotion.employee
                      ? `${promotion.employee.first_name} ${promotion.employee.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">{promotion.title}</TableCell>
                  <TableCell>
                    {promotion.promotion_date
                      ? format(new Date(promotion.promotion_date), "MMM dd, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {promotion.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(promotion)}
                        title="Edit"
                      >
                        <Edit01Icon className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(promotion.id)}
                        disabled={isDeleting}
                        title="Delete"
                      >
                        <Delete01Icon className="size-5 text-destructive" />
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
  );
}
