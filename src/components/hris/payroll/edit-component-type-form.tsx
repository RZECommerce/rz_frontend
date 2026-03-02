import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { salaryComponentTypeService } from "@/services/payroll.service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UpdateSalaryComponentTypeDto } from "@/types/payroll";

const editComponentTypeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  calculation_type: z.enum(["fixed", "percentage", "per_day", "per_hour"]),
  is_taxable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional().nullable(),
});

export type EditComponentTypeFormData = z.infer<typeof editComponentTypeSchema>;

interface EditComponentTypeFormProps {
  typeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateSalaryComponentTypeDto) => void;
  isSubmitting: boolean;
}

export function EditComponentTypeForm({
  typeId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditComponentTypeFormProps) {
  const { data: componentType, isLoading } = useQuery({
    queryKey: ["salaryComponentType", typeId],
    queryFn: () => salaryComponentTypeService.getById(typeId),
    enabled: open && !!typeId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditComponentTypeFormData>({
    resolver: zodResolver(editComponentTypeSchema),
  });

  const calculationType = watch("calculation_type");
  const isTaxable = watch("is_taxable");
  const isActive = watch("is_active");

  React.useEffect(() => {
    if (componentType && open) {
      reset({
        code: componentType.code,
        name: componentType.name,
        category: componentType.category,
        calculation_type: componentType.calculation_type,
        is_taxable: componentType.is_taxable,
        is_active: componentType.is_active,
        description: componentType.description,
      });
    }
  }, [componentType, open, reset]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Edit Component Type
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update the salary component type details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              ...data,
              description: data.description || null,
            });
          })}
          className="space-y-6 mt-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g., TRANS_ALLOW"
              />
              {errors.code && (
                <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="e.g., allowance, bonus"
              />
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Transportation Allowance"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="calculation_type" className="text-sm font-medium">
              Calculation Type <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("calculation_type", value as any, { shouldValidate: true })}
              value={calculationType}
            >
              <SelectTrigger id="calculation_type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="per_day">Per Day</SelectItem>
                <SelectItem value="per_hour">Per Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_taxable"
                checked={isTaxable}
                onCheckedChange={(checked) => setValue("is_taxable", checked as boolean)}
              />
              <Label htmlFor="is_taxable" className="text-sm font-medium cursor-pointer">
                Taxable
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
