import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { travelService } from "@/services/core-hr.service";
import type { CoreHrFilters, Travel } from "@/types/core-hr";
import { Add as Add01Icon, Delete as Delete01Icon, Edit as Edit01Icon, Search as Search01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";

interface TravelsTableProps {
  filters: CoreHrFilters;
  onFiltersChange: (filters: CoreHrFilters) => void;
  onAdd: () => void;
  onEdit: (travel: Travel) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function TravelsTable({
  filters,
  onFiltersChange,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false,
}: TravelsTableProps) {
  const [search, setSearch] = React.useState(filters.search || "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["travels", filters],
    queryFn: () => travelService.getAll(filters),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const travels = data?.data || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  return (
    <div className="rounded-xl bg-card overflow-hidden border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b">
        <span className="font-semibold">Travels</span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9 w-full sm:w-[220px] h-9" />
          </div>
          <Button onClick={onAdd} size="sm">
            <Add01Icon className="size-5 mr-2" /> Add
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Place of Visit</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-destructive">Error loading data. Please check your connection or try again later.</TableCell></TableRow>
            ) : travels.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No travels found</TableCell></TableRow>
            ) : (
              travels.map((travel) => (
                <TableRow key={travel.id}>
                  <TableCell>{travel.employee ? `${travel.employee.first_name} ${travel.employee.last_name}` : "-"}</TableCell>
                  <TableCell className="font-medium">{travel.place_of_visit}</TableCell>
                  <TableCell>{travel.purpose_of_visit}</TableCell>
                  <TableCell>{travel.start_date ? format(new Date(travel.start_date), "MMM dd, yyyy") : "-"}</TableCell>
                  <TableCell>{travel.end_date ? format(new Date(travel.end_date), "MMM dd, yyyy") : "-"}</TableCell>
                  <TableCell>{travel.status || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(travel)} title="Edit">
                        <Edit01Icon className="size-5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(travel.id)} disabled={isDeleting} title="Delete">
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
