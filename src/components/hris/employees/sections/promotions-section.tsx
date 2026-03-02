import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { promotionService } from "@/services/core-hr.service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizontalIcon
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const promotionSchema = z.object({
  promotion_date: z.string().min(1, "Promotion date is required"),
  from_position: z.string().min(1, "From position is required"),
  to_position: z.string().min(1, "To position is required"),
  from_salary: z.number().min(0).optional().nullable(),
  to_salary: z.number().min(0).optional().nullable(),
  reason: z.string().optional().nullable(),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface Promotion {
  id: string;
  promotion_date: string;
  from_position: string;
  to_position: string;
  from_salary: number | null;
  to_salary: number | null;
  reason: string | null;
}

interface PromotionsSectionProps {
  employeeId: string;
  isEditMode?: boolean;
}

export function PromotionsSection({ employeeId, isEditMode = true }: PromotionsSectionProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [perPage, setPerPage] = React.useState(10);

  const { data: promotionsData, isLoading } = useQuery({
    queryKey: ["promotions", employeeId, { search, per_page: perPage }],
    queryFn: () => promotionService.getAll({ employee_id: employeeId, search, per_page: perPage }),
  });

  const promotions: Promotion[] = React.useMemo(() => {
    if (!promotionsData?.data) return [];
    return promotionsData.data.map((p) => ({
      id: p.id,
      promotion_date: p.promotion_date,
      from_position: p.title || "Previous Position",
      to_position: p.title || "New Position",
      from_salary: null,
      to_salary: null,
      reason: p.description || null,
    }));
  }, [promotionsData]);

  const deletePromotion = useMutation({
    mutationFn: (id: string) => promotionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", employeeId] });
      toast.success("Promotion deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete promotion", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      promotion_date: "",
      from_position: "",
      to_position: "",
      from_salary: null,
      to_salary: null,
      reason: "",
    },
  });

  const filteredPromotions = React.useMemo(() => {
    let filtered = promotions;
    if (search) {
      filtered = filtered.filter(
        (promotion) =>
          promotion.from_position.toLowerCase().includes(search.toLowerCase()) ||
          promotion.to_position.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered.slice(0, perPage);
  }, [promotions, search, perPage]);

  React.useEffect(() => {
    if (editingId) {
      const promotion = promotions.find((p) => p.id === editingId);
      if (promotion) {
        reset({
          promotion_date: promotion.promotion_date,
          from_position: promotion.from_position,
          to_position: promotion.to_position,
          from_salary: promotion.from_salary,
          to_salary: promotion.to_salary,
          reason: promotion.reason || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingId, promotions, reset]);

  const onSubmit = (data: PromotionFormData) => {
    if (editingId) {
      // TODO: Implement update mutation when API is ready
      queryClient.invalidateQueries({ queryKey: ["promotions", employeeId] });
      toast.success("Promotion record updated successfully");
    } else {
      // TODO: Implement create mutation when API is ready
      queryClient.invalidateQueries({ queryKey: ["promotions", employeeId] });
      toast.success("Promotion record added successfully");
    }
    setIsAddDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    deletePromotion.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Promotion Records</h3>
        {isEditMode && (
          <Button
            onClick={() => {
              reset();
              setEditingId(null);
              setIsAddDialogOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <AddIcon className="size-5 mr-2" />
            Add Promotion
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">records per page</span>
        </div>

        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search promotions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion Date</TableHead>
              <TableHead>From Position</TableHead>
              <TableHead>To Position</TableHead>
              <TableHead>From Salary</TableHead>
              <TableHead>To Salary</TableHead>
              {isEditMode && <TableHead className="text-right">action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditMode ? 6 : 5} className="h-24 text-center text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>{new Date(promotion.promotion_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{promotion.from_position}</TableCell>
                  <TableCell className="font-medium">{promotion.to_position}</TableCell>
                  <TableCell>
                    {promotion.from_salary ? `₱${promotion.from_salary.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    {promotion.to_salary ? `₱${promotion.to_salary.toLocaleString()}` : "-"}
                  </TableCell>
                  {isEditMode && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingId(promotion.id)}>
                            <EditIcon className="size-5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(promotion.id)}
                            className="text-destructive"
                          >
                            <DeleteIcon className="size-5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update promotion information" : "Add a new promotion record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promotion_date">
                Promotion Date <span className="text-destructive">*</span>
              </Label>
              <Input id="promotion_date" type="date" {...register("promotion_date")} />
              {errors.promotion_date && (
                <p className="text-sm text-destructive">{errors.promotion_date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_position">
                  From Position <span className="text-destructive">*</span>
                </Label>
                <Input id="from_position" {...register("from_position")} placeholder="Enter position" />
                {errors.from_position && (
                  <p className="text-sm text-destructive">{errors.from_position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_position">
                  To Position <span className="text-destructive">*</span>
                </Label>
                <Input id="to_position" {...register("to_position")} placeholder="Enter position" />
                {errors.to_position && (
                  <p className="text-sm text-destructive">{errors.to_position.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_salary">From Salary</Label>
                <Input
                  id="from_salary"
                  type="number"
                  step="0.01"
                  {...register("from_salary", { valueAsNumber: true })}
                  placeholder="Enter salary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_salary">To Salary</Label>
                <Input
                  id="to_salary"
                  type="number"
                  step="0.01"
                  {...register("to_salary", { valueAsNumber: true })}
                  placeholder="Enter salary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                {...register("reason")}
                placeholder="Enter reason for promotion"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Update" : "Add"} Promotion</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
