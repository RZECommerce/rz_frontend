import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { travelService } from "@/services/core-hr.service";
import type { Travel, CoreHrFilters } from "@/types/core-hr";
import { TravelsTable } from "../tables/travels-table";
import { TravelForm } from "../forms/travel-form";

export function TravelsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CoreHrFilters>({ per_page: 15 });
  const [editingItem, setEditingItem] = useState<Travel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createTravel = useMutation({
    mutationFn: travelService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const updateTravel = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      travelService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels"] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteTravel = useMutation({
    mutationFn: travelService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels"] });
    },
  });

  return (
    <div className="space-y-4">
      <TravelsTable
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
        onEdit={(travel) => {
          setEditingItem(travel);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => {
          if (confirm("Are you sure you want to delete this travel?")) {
            deleteTravel.mutate(id);
          }
        }}
        isDeleting={deleteTravel.isPending}
      />
      <TravelForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateTravel.mutate({ id: editingItem.id, data });
          } else {
            createTravel.mutate(data);
          }
        }}
        isSubmitting={createTravel.isPending || updateTravel.isPending}
      />
    </div>
  );
}
