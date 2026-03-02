import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService } from "@/services/core-hr.service";
import type { Complaint, CoreHrFilters } from "@/types/core-hr";
import { ComplaintsTable } from "../tables/complaints-table";
import { ComplaintForm } from "../forms/complaint-form";

export function ComplaintsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({ per_page: 15 });
  const [editingItem, setEditingItem] = useState<Complaint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createComplaint = useMutation({
    mutationFn: complaintService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateComplaint = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      complaintService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteComplaint = useMutation({
    mutationFn: complaintService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });

  return (
    <div className="space-y-4">
      <ComplaintsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
        onEdit={(complaint) => {
          setEditingItem(complaint);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this complaint?")) {
            deleteComplaint.mutate(id);
          }
        }}
        isDeleting={deleteComplaint.isPending}
      />
      <ComplaintForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateComplaint.mutate({ id: editingItem.id, data });
          } else {
            createComplaint.mutate(data);
          }
        }}
        isSubmitting={createComplaint.isPending || updateComplaint.isPending}
      />
    </div>
  );
}
