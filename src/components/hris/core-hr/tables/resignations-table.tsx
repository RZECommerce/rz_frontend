import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resignationService } from "@/services/core-hr.service";
import type { CoreHrFilters, Resignation } from "@/types/core-hr";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";

interface ResignationsTableProps {
  filters: CoreHrFilters;
  onFiltersChange: (filters: CoreHrFilters) => void;
  onAdd: () => void;
  onEdit: (resignation: Resignation) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ResignationsTable({
  filters,
  onFiltersChange,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false,
}: ResignationsTableProps) {
  const [search, setSearch] = React.useState(filters.search || "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resignations", filters],
    queryFn: () => resignationService.getAll(filters),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const resignations = data?.data || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  return (
    <div className="rounded-xl bg-card overflow-hidden border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b">
        <span className="font-semibold">Resignations</span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9 w-full sm:w-[220px] h-9" />
          </div>
          <Button onClick={onAdd} size="sm">
            <AddIcon className="size-5 mr-2" /> Add
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Resignation Date</TableHead>
              <TableHead>Notice Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-destructive">Error loading data. Please check your connection or try again later.</TableCell></TableRow>
            ) : resignations.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No resignations found</TableCell></TableRow>
            ) : (
              resignations.map((resignation) => (
                <TableRow key={resignation.id}>
                  <TableCell>{resignation.employee ? `${resignation.employee.first_name} ${resignation.employee.last_name}` : "-"}</TableCell>
                  <TableCell>{resignation.department?.name || "-"}</TableCell>
                  <TableCell className="font-medium">{resignation.resignation_date ? format(new Date(resignation.resignation_date), "MMM dd, yyyy") : "-"}</TableCell>
                  <TableCell>{resignation.notice_date ? format(new Date(resignation.notice_date), "MMM dd, yyyy") : "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{resignation.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(resignation)} title="Edit">
                        <EditIcon className="size-5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(resignation.id)} disabled={isDeleting} title="Delete">
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
  );
}
