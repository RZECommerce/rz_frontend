import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { warningService } from "@/services/core-hr.service";
import type { Warning, CoreHrFilters } from "@/types/core-hr";
import { WarningsTable } from "../tables/warnings-table";
import { WarningForm } from "../forms/warning-form";

export function WarningsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({ per_page: 15 });
  const [editingItem, setEditingItem] = useState<Warning | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createWarning = useMutation({
    mutationFn: warningService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warnings"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateWarning = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      warningService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warnings"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteWarning = useMutation({
    mutationFn: warningService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warnings"] });
    },
  });

  return (
    <div className="space-y-4">
      <WarningsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
        onEdit={(warning) => {
          setEditingItem(warning);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this warning?")) {
            deleteWarning.mutate(id);
          }
        }}
        isDeleting={deleteWarning.isPending}
      />
      <WarningForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateWarning.mutate({ id: editingItem.id, data });
          } else {
            createWarning.mutate(data);
          }
        }}
        isSubmitting={createWarning.isPending || updateWarning.isPending}
      />
    </div>
  );
}
