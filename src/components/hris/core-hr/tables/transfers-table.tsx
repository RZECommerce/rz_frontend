import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { transferService } from "@/services/core-hr.service";
import type { CoreHrFilters, Transfer } from "@/types/core-hr";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";

interface TransfersTableProps {
  filters: CoreHrFilters;
  onFiltersChange: (filters: CoreHrFilters) => void;
  onAdd: () => void;
  onEdit: (transfer: Transfer) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function TransfersTable({
  filters,
  onFiltersChange,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false,
}: TransfersTableProps) {
  const [search, setSearch] = React.useState(filters.search || "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["transfers", filters],
    queryFn: () => transferService.getAll(filters),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const transfers = data?.data || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  return (
    <div className="rounded-xl bg-card overflow-hidden border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b">
        <span className="font-semibold">Transfers</span>
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
              <TableHead>From Department</TableHead>
              <TableHead>To Department</TableHead>
              <TableHead>Transfer Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-destructive">Error loading data. Please check your connection or try again later.</TableCell></TableRow>
            ) : transfers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No transfers found</TableCell></TableRow>
            ) : (
              transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{transfer.employee ? `${transfer.employee.first_name} ${transfer.employee.last_name}` : "-"}</TableCell>
                  <TableCell>{transfer.from_department?.name || "-"}</TableCell>
                  <TableCell className="font-medium">{transfer.to_department?.name || "-"}</TableCell>
                  <TableCell>{transfer.transfer_date ? format(new Date(transfer.transfer_date), "MMM dd, yyyy") : "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{transfer.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" onClick={() => onEdit(transfer)} title="Edit">
                        <EditIcon className="size-5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(transfer.id)} disabled={isDeleting} title="Delete">
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
