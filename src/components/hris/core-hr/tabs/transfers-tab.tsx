import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transferService } from "@/services/core-hr.service";
import type { Transfer, CoreHrFilters } from "@/types/core-hr";
import { TransfersTable } from "../tables/transfers-table";
import { TransferForm } from "../forms/transfer-form";

export function TransfersTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({ per_page: 15 });
  const [editingItem, setEditingItem] = useState<Transfer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createTransfer = useMutation({
    mutationFn: transferService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateTransfer = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transferService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteTransfer = useMutation({
    mutationFn: transferService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });

  return (
    <div className="space-y-4">
      <TransfersTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
        onEdit={(transfer) => {
          setEditingItem(transfer);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this transfer?")) {
            deleteTransfer.mutate(id);
          }
        }}
        isDeleting={deleteTransfer.isPending}
      />
      <TransferForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateTransfer.mutate({ id: editingItem.id, data });
          } else {
            createTransfer.mutate(data);
          }
        }}
        isSubmitting={createTransfer.isPending || updateTransfer.isPending}
      />
    </div>
  );
}
