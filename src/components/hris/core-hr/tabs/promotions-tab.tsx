import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionService } from "@/services/core-hr.service";
import type { Promotion, CoreHrFilters } from "@/types/core-hr";
import { PromotionsTable } from "../tables/promotions-table";
import { PromotionForm } from "../forms/promotion-form";

export function PromotionsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({
    per_page: 15,
  });
  const [editingItem, setEditingItem] = useState<Promotion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createPromotion = useMutation({
    mutationFn: promotionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updatePromotion = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      promotionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deletePromotion = useMutation({
    mutationFn: promotionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  const handleAddClick = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingItem(promotion);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      deletePromotion.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updatePromotion.mutate({ id: editingItem.id, data });
    } else {
      createPromotion.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <PromotionsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={handleAddClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deletePromotion.isPending}
      />
      <PromotionForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createPromotion.isPending || updatePromotion.isPending}
      />
    </div>
  );
}
