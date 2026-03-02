import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resignationService } from "@/services/core-hr.service";
import type { Resignation, CoreHrFilters } from "@/types/core-hr";
import { ResignationsTable } from "../tables/resignations-table";
import { ResignationForm } from "../forms/resignation-form";

export function ResignationsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({ per_page: 15 });
  const [editingItem, setEditingItem] = useState<Resignation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createResignation = useMutation({
    mutationFn: resignationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateResignation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      resignationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteResignation = useMutation({
    mutationFn: resignationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
    },
  });

  return (
    <div className="space-y-4">
      <ResignationsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
        onEdit={(resignation) => {
          setEditingItem(resignation);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this resignation?")) {
            deleteResignation.mutate(id);
          }
        }}
        isDeleting={deleteResignation.isPending}
      />
      <ResignationForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateResignation.mutate({ id: editingItem.id, data });
          } else {
            createResignation.mutate(data);
          }
        }}
        isSubmitting={createResignation.isPending || updateResignation.isPending}
      />
    </div>
  );
}
