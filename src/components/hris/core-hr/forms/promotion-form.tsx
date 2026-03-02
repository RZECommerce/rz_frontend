import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeService } from "@/services/employee.service";
import type { Promotion, CreatePromotionDto } from "@/types/core-hr";

const promotionSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  promotion_date: z.string().min(1, "Promotion date is required"),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Promotion | null;
  onSubmit: (data: CreatePromotionDto) => void;
  isSubmitting: boolean;
}

export function PromotionForm({
  open,
  onOpenChange,
  editingItem,
  onSubmit,
  isSubmitting,
}: PromotionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      employee_id: "",
      title: "",
      description: null,
      promotion_date: "",
    },
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  React.useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          employee_id: editingItem.employee_id,
          title: editingItem.title,
          description: editingItem.description || null,
          promotion_date: editingItem.promotion_date,
        });
      } else {
        reset({
          employee_id: "",
          title: "",
          description: null,
          promotion_date: "",
        });
      }
    }
  }, [open, editingItem, reset]);

  const employees = employeesData?.data || [];

  const selectedEmployee = React.useMemo(
    () => employees.find((emp) => emp.id === watch("employee_id")),
    [employees, watch("employee_id")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
          <DialogDescription>
            {editingItem ? "Update promotion information" : "Add a new promotion record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">
              Employee <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("employee_id")}
              onValueChange={(value) => setValue("employee_id", value || "", { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Employee...">
                  {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : "Select Employee..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && (
              <p className="text-sm text-destructive">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input id="title" {...register("title")} placeholder="Title" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_date">
              Promotion Date <span className="text-destructive">*</span>
            </Label>
            <Input id="promotion_date" type="date" {...register("promotion_date")} />
            {errors.promotion_date && (
              <p className="text-sm text-destructive">{errors.promotion_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
