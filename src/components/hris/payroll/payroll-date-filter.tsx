
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateRange = "30days" | "3months" | "1year";

interface PayrollDateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function PayrollDateFilter({
  value,
  onChange,
}: PayrollDateFilterProps) {
  const options: { value: DateRange; label: string }[] = [
    { value: "30days", label: "30 Days" },
    { value: "3months", label: "3 Months" },
    { value: "1year", label: "1 Year" },
  ];

  return (
    <div className="flex items-center gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            value === option.value &&
              "bg-foreground text-background hover:bg-foreground/90"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

