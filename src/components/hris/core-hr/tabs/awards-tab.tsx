import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { awardService } from "@/services/core-hr.service";
import type { Award, CoreHrFilters } from "@/types/core-hr";
import { AwardsTable } from "../tables/awards-table";
import { AwardForm } from "../forms/award-form";

export function AwardsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({
    per_page: 15,
  });
  const [editingItem, setEditingItem] = useState<Award | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createAward = useMutation({
    mutationFn: awardService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateAward = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      awardService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteAward = useMutation({
    mutationFn: awardService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });

  const handleAddClick = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (award: Award) => {
    setEditingItem(award);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this award?")) {
      deleteAward.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateAward.mutate({ id: editingItem.id, data });
    } else {
      createAward.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <AwardsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={handleAddClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteAward.isPending}
      />
      <AwardForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createAward.isPending || updateAward.isPending}
      />
    </div>
  );
}
