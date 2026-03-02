import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { complaintService } from "@/services/core-hr.service";
import type { Complaint, CoreHrFilters } from "@/types/core-hr";
import { Add as Add01Icon, Delete as Delete01Icon, Edit as Edit01Icon, Search as Search01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";

interface ComplaintsTableProps {
  filters: CoreHrFilters;
  onFiltersChange: (filters: CoreHrFilters) => void;
  onAdd: () => void;
  onEdit: (complaint: Complaint) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ComplaintsTable({
  filters,
  onFiltersChange,
  onAdd,
  onEdit,
  onDelete,
  isDeleting = false,
}: ComplaintsTableProps) {
  const [search, setSearch] = React.useState(filters.search || "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["complaints", filters],
    queryFn: () => complaintService.getAll(filters),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const complaints = data?.data || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  return (
    <div className="rounded-xl bg-card overflow-hidden border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b">
        <span className="font-semibold">Complaints</span>
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
              <TableHead>Complaint Title</TableHead>
              <TableHead>Complaint From</TableHead>
              <TableHead>Complaint Against</TableHead>
              <TableHead>Complaint Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-destructive">Error loading data. Please check your connection or try again later.</TableCell></TableRow>
            ) : complaints.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No complaints found</TableCell></TableRow>
            ) : (
              complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.complaint_title}</TableCell>
                  <TableCell>{complaint.complaint_from_name || complaint.complaint_from}</TableCell>
                  <TableCell>{complaint.complaint_against_name || complaint.complaint_against}</TableCell>
                  <TableCell>{complaint.complaint_date ? format(new Date(complaint.complaint_date), "MMM dd, yyyy") : "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{complaint.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(complaint)} title="Edit">
                        <Edit01Icon className="size-5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(complaint.id)} disabled={isDeleting} title="Delete">
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
