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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Training, CreateTrainingDto, TrainingType, Trainer } from "@/types/training";
import { useQuery } from "@tanstack/react-query";
import { trainingService } from "@/services/training.service";

const trainingSchema = z.object({
  training_type_id: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  delivery_method: z.enum(["online", "classroom", "blended"]).default("classroom"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  total_hours: z.number().optional().nullable(),
  max_participants: z.number().optional().nullable(),
  status: z.enum(["planned", "scheduled", "ongoing", "completed", "cancelled"]).default("planned"),
  certificate_template: z.string().optional().nullable(),
  trainer_ids: z.array(z.string()).optional().nullable(),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface TrainingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTrainingDto) => void;
  isSubmitting: boolean;
  training?: Training | null;
}

export function TrainingForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  training,
}: TrainingFormProps) {
  const { data: trainingTypes = [] } = useQuery({
    queryKey: ["training-types"],
    queryFn: () => trainingService.getTrainingTypes(),
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ["trainers"],
    queryFn: () => trainingService.getTrainers(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      training_type_id: training?.training_type_id || null,
      title: training?.title || "",
      description: training?.description || null,
      location: training?.location || null,
      delivery_method: training?.delivery_method || "classroom",
      start_date: training?.start_date || null,
      end_date: training?.end_date || null,
      total_hours: training?.total_hours || null,
      max_participants: training?.max_participants || null,
      status: training?.status || "planned",
      certificate_template: training?.certificate_template || null,
      trainer_ids: training?.trainers?.map((t) => t.id) || [],
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        training_type_id: training?.training_type_id || null,
        title: training?.title || "",
        description: training?.description || null,
        location: training?.location || null,
        delivery_method: training?.delivery_method || "classroom",
        start_date: training?.start_date || null,
        end_date: training?.end_date || null,
        total_hours: training?.total_hours || null,
        max_participants: training?.max_participants || null,
        status: training?.status || "planned",
        certificate_template: training?.certificate_template || null,
        trainer_ids: training?.trainers?.map((t) => t.id) || [],
      });
    }
  }, [open, training, reset]);

  const selectedTrainingType = React.useMemo(
    () => trainingTypes.find((type) => type.id === watch("training_type_id")),
    [trainingTypes, watch("training_type_id")]
  );

  const selectedTrainer = React.useMemo(
    () => trainers.find((trainer) => trainer.id === watch("trainer_ids")?.[0]),
    [trainers, watch("trainer_ids")]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto font-sans [&_[data-slot=button][data-variant=outline]]:border-primary/20 [&_[data-slot=button][data-variant=outline]]:hover:bg-primary/5 [&_[data-slot=button][data-variant=ghost]]:hover:bg-primary/5">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle>{training ? "Edit Training" : "Create Training"}</DialogTitle>
          <DialogDescription>
            {training ? "Update training information" : "Create a new training program"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="training_type_id">Training Type</Label>
              <Controller
                name="training_type_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select training type">
                        {selectedTrainingType ? selectedTrainingType.name : "Select training type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {trainingTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_method">Delivery Method</Label>
              <Controller
                name="delivery_method"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="blended">Blended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="Training location" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_hours">Total Hours</Label>
              <Input
                id="total_hours"
                type="number"
                step="0.01"
                {...register("total_hours", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                {...register("max_participants", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainer_ids">Trainers</Label>
            <Controller
              name="trainer_ids"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.[0] || ""}
                  onValueChange={(value) => {
                    field.onChange(value ? [value] : []);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer">
                      {selectedTrainer ? `${selectedTrainer.name} ${selectedTrainer.is_internal ? "(Internal)" : "(External)"}` : "Select trainer"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} {trainer.is_internal ? "(Internal)" : "(External)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : training ? "Update" : "Create Training"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
