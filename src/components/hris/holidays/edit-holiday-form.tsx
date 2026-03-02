
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { holidayService } from "@/services/holiday.service";
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
import type { UpdateHolidayDto } from "@/types/holiday";

const updateHolidaySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  date: z.string().min(1, "Date is required").optional(),
  type: z.enum(["regular", "special_non_working"]).optional(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export type UpdateHolidayFormData = z.infer<typeof updateHolidaySchema>;

interface EditHolidayFormProps {
  holidayId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateHolidayDto) => void;
  isSubmitting: boolean;
}

export function EditHolidayForm({
  holidayId,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditHolidayFormProps) {
  const { data: holiday, isLoading: isLoadingHoliday } = useQuery({
    queryKey: ["holiday", holidayId],
    queryFn: () => holidayService.getById(holidayId),
    enabled: open && !!holidayId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateHolidayFormData>({
    resolver: zodResolver(updateHolidaySchema),
    defaultValues: {},
  });

  React.useEffect(() => {
    if (holiday) {
      reset({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type,
        description: holiday.description || null,
        is_active: holiday.is_active,
      });
    }
  }, [holiday, reset]);

  const selectedType = watch("type");
  const isActive = watch("is_active");

  if (isLoadingHoliday) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="h-32 flex items-center justify-center">
            <p className="text-muted-foreground">Loading holiday data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Edit Holiday
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update holiday information. Only fill in the fields you want to change.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            const updateData: UpdateHolidayDto = {};
            if (data.name) updateData.name = data.name;
            if (data.date) updateData.date = data.date;
            if (data.type) updateData.type = data.type;
            if (data.description !== undefined) updateData.description = data.description || null;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;
            onSubmit(updateData);
          })}
          className="space-y-6 mt-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Holiday Name
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive mt-1">
                {errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type
            </Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              value={selectedType || ""}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Holiday (200% pay)</SelectItem>
                <SelectItem value="special_non_working">Special Non-Working (130% if worked)</SelectItem>
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
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
            />
            <Label
              htmlFor="is_active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active
            </Label>
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
              {isSubmitting ? "Updating..." : "Update Holiday"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

