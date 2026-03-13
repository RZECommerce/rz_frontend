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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TrainingType, CreateTrainingTypeDto } from "@/types/training";

const trainingTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  is_mandatory: z.boolean().default(false),
  default_duration_hours: z.number().optional().nullable(),
  is_active: z.boolean().default(true),
});

type TrainingTypeFormData = z.infer<typeof trainingTypeSchema>;

interface TrainingTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTrainingTypeDto) => void;
  isSubmitting: boolean;
  trainingType?: TrainingType | null;
}

export function TrainingTypeForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  trainingType,
}: TrainingTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TrainingTypeFormData>({
    resolver: zodResolver(trainingTypeSchema),
    defaultValues: {
      name: trainingType?.name || "",
      description: trainingType?.description || null,
      is_mandatory: trainingType?.is_mandatory || false,
      default_duration_hours: trainingType?.default_duration_hours || null,
      is_active: trainingType?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: trainingType?.name || "",
        description: trainingType?.description || null,
        is_mandatory: trainingType?.is_mandatory || false,
        default_duration_hours: trainingType?.default_duration_hours || null,
        is_active: trainingType?.is_active ?? true,
      });
    }
  }, [open, trainingType, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>
            {trainingType ? "Edit Training Type" : "Create Training Type"}
          </DialogTitle>
          <DialogDescription>
            {trainingType
              ? "Update training type information"
              : "Create a new training type category"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_duration_hours">Default Duration (Hours)</Label>
              <Input
                id="default_duration_hours"
                type="number"
                step="0.01"
                {...register("default_duration_hours", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_mandatory"
                checked={watch("is_mandatory")}
                onCheckedChange={(checked) => {
                  setValue("is_mandatory", checked === true);
                }}
              />
              <Label htmlFor="is_mandatory" className="cursor-pointer">
                Mandatory Training
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => {
                  setValue("is_active", checked === true);
                }}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : trainingType ? "Update" : "Create Training Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
