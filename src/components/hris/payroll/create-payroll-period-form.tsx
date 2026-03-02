
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
import type { CreatePayrollPeriodDto } from "@/types/payroll";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const PERIOD_HALVES = ["First Half", "Second Half"];
const WEEK_NUMBERS = ["1st Week", "2nd Week", "3rd Week", "4th Week", "5th Week"];

const createPayrollPeriodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["monthly", "semi_monthly", "weekly", "bi_weekly"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  pay_date: z.string().min(1, "Pay date is required"),
  is_active: z.boolean().optional(),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const pay = new Date(data.pay_date);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
}).refine((data) => {
  const end = new Date(data.end_date);
  const pay = new Date(data.pay_date);
  return pay >= end;
}, {
  message: "Pay date must be on or after end date",
  path: ["pay_date"],
});

export type CreatePayrollPeriodFormData = z.infer<typeof createPayrollPeriodSchema>;

interface CreatePayrollPeriodFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePayrollPeriodDto) => void;
  isSubmitting: boolean;
}

export function CreatePayrollPeriodForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreatePayrollPeriodFormProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = React.useState(currentMonth);
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const [selectedHalf, setSelectedHalf] = React.useState<"First Half" | "Second Half">("First Half");
  const [selectedWeek, setSelectedWeek] = React.useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreatePayrollPeriodFormData>({
    resolver: zodResolver(createPayrollPeriodSchema),
    defaultValues: {
      name: "",
      type: "semi_monthly",
      start_date: "",
      end_date: "",
      pay_date: "",
      is_active: true,
    },
  });

  const selectedType = watch("type");

  const calculateDates = React.useCallback((type: string, month: number, year: number, half?: string, weekNum?: number) => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    let startDate: Date;
    let endDate: Date;
    let payDate: Date;

    if (type === "semi_monthly") {
      // PH DOLE Standard: Semi-Monthly periods are 1-15 and 16-end of month
      // Pay must be made within 5 days after period end (Labor Code Art. 103)
      if (half === "First Half") {
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month, 15);
        // Pay on 20th (5 days after 15th, common PH practice)
        payDate = new Date(year, month, 20);
      } else {
        startDate = new Date(year, month, 16);
        endDate = new Date(year, month + 1, 0); // Last day of month
        // Pay on 5th of next month (within 5 days, common PH practice)
        payDate = new Date(year, month + 1, 5);
      }
    } else if (type === "monthly") {
      // PH Standard: Monthly payroll covers full month
      // Pay on last working day of month or within first 5 days of next month
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0); // Last day of month
      // Pay on 5th of next month (common PH practice)
      payDate = new Date(year, month + 1, 5);
    } else if (type === "weekly") {
      // PH Labor Code: Weekly wages must be paid within 7 days after end of week
      // Week runs Monday to Sunday
      const firstDayOfMonth = new Date(year, month, 1);
      const dayOfWeek = firstDayOfMonth.getDay();
      const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : (8 - dayOfWeek);
      
      startDate = new Date(year, month, 1);
      startDate.setDate(1 + daysToMonday + (weekNum || 0) * 7);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday
      
      // Pay within 7 days (Friday after week ends, common practice)
      payDate = new Date(endDate);
      payDate.setDate(endDate.getDate() + 5); // Following Friday
    } else {
      // Bi-Weekly: 14-day periods, Monday to Sunday
      // Pay within 7 days after period end
      const firstDayOfMonth = new Date(year, month, 1);
      const dayOfWeek = firstDayOfMonth.getDay();
      const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : (8 - dayOfWeek);
      
      startDate = new Date(year, month, 1);
      startDate.setDate(1 + daysToMonday);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 13); // 14 days total
      
      // Pay within 7 days (Friday after period ends)
      payDate = new Date(endDate);
      payDate.setDate(endDate.getDate() + 5);
    }

    return {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      pay_date: formatDate(payDate),
    };
  }, []);

  const generateName = React.useCallback((type: string, month: number, year: number, half?: string, weekNum?: number) => {
    const monthName = MONTHS[month];
    
    if (type === "semi_monthly") {
      return `${monthName} ${year} - ${half}`;
    } else if (type === "monthly") {
      return `${monthName} ${year}`;
    } else if (type === "weekly") {
      return `${monthName} ${year} - ${WEEK_NUMBERS[weekNum || 0]}`;
    } else {
      return `Bi-Weekly ${monthName} ${year}`;
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      const dates = calculateDates(selectedType, selectedMonth, selectedYear, selectedHalf, selectedWeek);
      const name = generateName(selectedType, selectedMonth, selectedYear, selectedHalf, selectedWeek);
      
      setValue("name", name);
      setValue("start_date", dates.start_date);
      setValue("end_date", dates.end_date);
      setValue("pay_date", dates.pay_date);
    }
  }, [open, selectedType, selectedMonth, selectedYear, selectedHalf, selectedWeek, setValue, calculateDates, generateName]);

  React.useEffect(() => {
    if (!open) {
      const currentDate = new Date();
      setSelectedMonth(currentDate.getMonth());
      setSelectedYear(currentDate.getFullYear());
      setSelectedHalf("First Half");
      setSelectedWeek(0);
      reset({
        name: "",
        type: "semi_monthly",
        start_date: "",
        end_date: "",
        pay_date: "",
        is_active: true,
      });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Create Payroll Period
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Create a new payroll period. This defines the time range for payroll processing.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              ...data,
              is_active: data.is_active ?? true,
            });
          })}
          className="space-y-6 mt-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm font-medium">
                Month <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => value && setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger id="month" className="w-full">
                  <SelectValue>
                    {MONTHS[selectedMonth]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">
                Year <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => value && setSelectedYear(parseInt(value))}
              >
                <SelectTrigger id="year" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 1 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("type", value as any, { shouldValidate: true })}
              value={selectedType}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select period type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
            )}
          </div>

          {selectedType === "semi_monthly" && (
            <div className="space-y-2">
              <Label htmlFor="half" className="text-sm font-medium">
                Period <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedHalf}
                onValueChange={(value) => setSelectedHalf(value as "First Half" | "Second Half")}
              >
                <SelectTrigger id="half" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_HALVES.map((half) => (
                    <SelectItem key={half} value={half}>
                      {half}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedType === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="week" className="text-sm font-medium">
                Week <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedWeek.toString()}
                onValueChange={(value) => value && setSelectedWeek(parseInt(value))}
              >
                <SelectTrigger id="week" className="w-full">
                  <SelectValue>
                    {WEEK_NUMBERS[selectedWeek]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {WEEK_NUMBERS.map((week, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Auto-generated based on selections"
              className="bg-muted"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-sm font-medium">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              {...register("start_date")}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-sm font-medium">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              {...register("end_date")}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay_date" className="text-sm font-medium">
              Pay Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pay_date"
              type="date"
              {...register("pay_date")}
            />
            {errors.pay_date && (
              <p className="text-sm text-destructive mt-1">{errors.pay_date.message}</p>
            )}
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

