import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { terminationService } from "@/services/core-hr.service";
import type { Termination, CoreHrFilters } from "@/types/core-hr";
import { TerminationsTable } from "../tables/terminations-table";
import { TerminationForm } from "../forms/termination-form";

export function TerminationsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({ per_page: 15 });
  const [editingItem, setEditingItem] = useState<Termination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createTermination = useMutation({
    mutationFn: terminationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminations"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateTermination = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      terminationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminations"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteTermination = useMutation({
    mutationFn: terminationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminations"] });
    },
  });

  return (
    <div className="space-y-4">
      <TerminationsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
        onEdit={(termination) => {
          setEditingItem(termination);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this termination?")) {
            deleteTermination.mutate(id);
          }
        }}
        isDeleting={deleteTermination.isPending}
      />
      <TerminationForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateTermination.mutate({ id: editingItem.id, data });
          } else {
            createTermination.mutate(data);
          }
        }}
        isSubmitting={createTermination.isPending || updateTermination.isPending}
      />
    </div>
  );
}
