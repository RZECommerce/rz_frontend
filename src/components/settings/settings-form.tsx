
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Department, Position, EmploymentType } from "@/types/employee";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

const positionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

const employmentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;
type PositionFormData = z.infer<typeof positionSchema>;
type EmploymentTypeFormData = z.infer<typeof employmentTypeSchema>;

type FormData = DepartmentFormData | PositionFormData | EmploymentTypeFormData;

interface SettingsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: "departments" | "positions" | "employment-types";
  editingItem: Department | Position | EmploymentType | null;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export function SettingsForm({
  open,
  onOpenChange,
  activeTab,
  editingItem,
  onSubmit,
  isSubmitting,
}: SettingsFormProps) {
  const getSchema = () => {
    if (activeTab === "departments") return departmentSchema;
    if (activeTab === "positions") return positionSchema;
    return employmentTypeSchema;
  };

  const getTitle = () => {
    const itemName =
      activeTab === "departments"
        ? "Department"
        : activeTab === "positions"
          ? "Position"
          : "Employment Type";
    return editingItem ? `Edit ${itemName}` : `Create ${itemName}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  React.useEffect(() => {
    if (editingItem) {
      setValue("name", editingItem.name);
      setValue("description", editingItem.description || "");
      setValue("is_active", editingItem.is_active);
    } else {
      reset({
        name: "",
        description: "",
        is_active: true,
      });
    }
  }, [editingItem, setValue, reset, activeTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {editingItem
              ? "Update the information below."
              : "Fill in the information to create a new item."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", !!checked)}
              aria-label="Active"
            />
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Active
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

