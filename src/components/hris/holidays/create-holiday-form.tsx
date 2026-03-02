
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
import type { CreateHolidayDto } from "@/types/holiday";

const createHolidaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["regular", "special_non_working"]),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type CreateHolidayFormData = z.infer<typeof createHolidaySchema>;

interface CreateHolidayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateHolidayDto) => void;
  isSubmitting: boolean;
  defaultDate?: string;
}

export function CreateHolidayForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultDate,
}: CreateHolidayFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateHolidayFormData>({
    resolver: zodResolver(createHolidaySchema),
    defaultValues: {
      name: "",
      date: defaultDate || "",
      type: "regular",
      description: null,
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: "",
        date: defaultDate ? (() => {
          const date = new Date(defaultDate);
          return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
        })() : "",
        type: "regular",
        description: null,
        is_active: true,
      });
    }
  }, [open, reset, defaultDate]);

  const selectedType = watch("type");
  const isActive = watch("is_active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Create Holiday
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Add a new holiday to the calendar. Regular holidays are paid at 200% of daily rate, while special non-working holidays are paid at 130% if worked.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              name: data.name,
              date: data.date,
              type: data.type,
              description: data.description || null,
              is_active: data.is_active,
            });
          })}
          className="space-y-6 mt-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Holiday Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., New Year's Day"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date <span className="text-destructive">*</span>
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
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value: string | null) => setValue("type", value as "regular" | "special_non_working")}
              value={selectedType}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Holiday (200% pay)</SelectItem>
                <SelectItem value="special_non_working">Special Non-Working (130% if worked)</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive mt-1">
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description for this holiday"
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
              {isSubmitting ? "Creating..." : "Create Holiday"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

