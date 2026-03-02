import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { salaryComponentTypeService } from "@/services/payroll.service";
import type { SalaryComponentTypeData } from "@/types/payroll";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Info as InfoIcon,
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

interface ViewComponentTypeModalProps {
  typeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewComponentTypeModal({
  typeId,
  open,
  onOpenChange,
}: ViewComponentTypeModalProps) {
  const { data: typeData, isLoading } = useQuery({
    queryKey: ["salaryComponentType", typeId],
    queryFn: () => salaryComponentTypeService.getById(typeId),
    enabled: open && !!typeId,
  });

  const type = typeData as SalaryComponentTypeData | undefined;

  const getCalculationIcon = (calcType: string) => {
    switch (calcType) {
      case "fixed":
        return <MoneyIcon className="size-5" />;
      case "percentage":
        return <PercentIcon className="size-5" />;
      case "per_hour":
        return <TimeIcon className="size-5" />;
      case "per_day":
        return <CalendarIcon className="size-5" />;
      default:
        return <CalculateIcon className="size-5" />;
    }
  };

  const getCalculationExamples = (type: SalaryComponentTypeData) => {
    const examples = [];
    const baseSalary = 50000;

    switch (type.calculation_type) {
      case "fixed":
        examples.push({
          label: "Fixed Amount",
          description: "Same amount for all employees regardless of salary",
          example: "Employee A (Salary: ₱50,000) = ₱5,000",
          example2: "Employee B (Salary: ₱80,000) = ₱5,000",
          formula: "Amount = Fixed Value",
        });
        break;
      case "percentage":
        examples.push({
          label: "Percentage of Salary",
          description: "Calculated as a percentage of employee's base salary",
          example: `Employee A (Salary: ₱50,000 × 10%) = ₱${(baseSalary * 0.1).toLocaleString()}`,
          example2: `Employee B (Salary: ₱80,000 × 10%) = ₱${(80000 * 0.1).toLocaleString()}`,
          formula: "Amount = Base Salary × (Percentage / 100)",
        });
        break;
      case "per_hour":
        examples.push({
          label: "Per Hour Rate",
          description: "Calculated based on number of hours worked",
          example: "Rate: ₱200/hour × 10 hours = ₱2,000",
          example2: "Rate: ₱200/hour × 20 hours = ₱4,000",
          formula: "Amount = Hourly Rate × Hours Worked",
        });
        break;
      case "per_day":
        examples.push({
          label: "Per Day Rate",
          description: "Calculated based on number of days worked",
          example: "Rate: ₱500/day × 5 days = ₱2,500",
          example2: "Rate: ₱500/day × 10 days = ₱5,000",
          formula: "Amount = Daily Rate × Days Worked",
        });
        break;
    }

    return examples;
  };

  const getCategoryDetails = (category: string) => {
    switch (category) {
      case "allowance":
        return {
          color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
          description: "Regular allowances provided to employees for specific expenses",
          examples: ["Transportation", "Meal", "Communication", "Housing", "Clothing"],
          taxNote: "Some allowances may be tax-exempt up to certain limits per BIR regulations",
        };
      case "bonus":
        return {
          color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
          description: "Performance-based or periodic bonuses given to employees",
          examples: ["13th Month Pay", "Performance Bonus", "Year-end Bonus", "Productivity Bonus"],
          taxNote: "Generally taxable, except 13th month pay up to ₱90,000 (as of 2023)",
        };
      case "commission":
        return {
          color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400",
          description: "Earnings based on sales or performance metrics",
          examples: ["Sales Commission", "Referral Commission", "Performance Commission"],
          taxNote: "Fully taxable as part of compensation income",
        };
      case "other":
        return {
          color: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400",
          description: "Other types of compensation not categorized above",
          examples: ["Overtime Premium", "Night Differential", "Hazard Pay", "Holiday Pay"],
          taxNote: "Tax treatment varies depending on the specific type of compensation",
        };
      default:
        return {
          color: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400",
          description: "Uncategorized component type",
          examples: [],
          taxNote: "Consult with accounting for tax treatment",
        };
    }
  };

  if (isLoading || !type) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading component type details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const categoryDetails = getCategoryDetails(type.category);
  const calculationExamples = getCalculationExamples(type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <InfoIcon className="size-6" />
            Component Type Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this salary component type
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <InfoIcon className="size-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code</label>
                <p className="text-base font-mono font-semibold mt-1">{type.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-semibold mt-1">{type.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <div className="mt-1">
                  <span className={cn("capitalize inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium", categoryDetails.color)}>
                    {type.category}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Calculation Type</label>
                <div className="mt-1 flex items-center gap-2">
                  {getCalculationIcon(type.calculation_type)}
                  <span className="capitalize font-medium">
                    {type.calculation_type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax Status</label>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium",
                      type.is_taxable
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                    )}
                  >
                    {type.is_taxable ? "Taxable" : "Tax-Free"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-md border text-sm font-medium",
                      type.is_active
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                        : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                    )}
                  >
                    {type.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </div>
            {type.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base mt-1 text-foreground">{type.description}</p>
              </div>
            )}
          </div>

          {/* Category Details */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Category: {type.category}</h3>
            <p className="text-sm text-muted-foreground">{categoryDetails.description}</p>
            {categoryDetails.examples.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Common Examples</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryDetails.examples.map((example, index) => (
                    <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Tax Note:</p>
              <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">{categoryDetails.taxNote}</p>
            </div>
          </div>

          {/* Calculation Method & Examples */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalculateIcon className="size-5" />
              Calculation Method & Examples
            </h3>
            {calculationExamples.map((calc, index) => (
              <div key={index} className="space-y-3">
                <div>
                  <h4 className="font-semibold text-base">{calc.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{calc.description}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-md p-4 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-purple-900 dark:text-purple-300 uppercase">Formula</p>
                    <p className="text-sm font-mono text-purple-800 dark:text-purple-400 mt-1">{calc.formula}</p>
                  </div>
                  <div className="border-t border-purple-200 dark:border-purple-800 pt-2 space-y-1">
                    <p className="text-xs font-medium text-purple-900 dark:text-purple-300 uppercase">Examples</p>
                    <p className="text-sm text-purple-800 dark:text-purple-400">{calc.example}</p>
                    <p className="text-sm text-purple-800 dark:text-purple-400">{calc.example2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tax Implications */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Tax Implications</h3>
            <div className={cn(
              "rounded-md p-4 border",
              type.is_taxable
                ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
            )}>
              <p className={cn(
                "font-semibold mb-2",
                type.is_taxable
                  ? "text-orange-900 dark:text-orange-300"
                  : "text-emerald-900 dark:text-emerald-300"
              )}>
                {type.is_taxable ? "This component is TAXABLE" : "This component is TAX-FREE"}
              </p>
              <p className={cn(
                "text-sm",
                type.is_taxable
                  ? "text-orange-800 dark:text-orange-400"
                  : "text-emerald-800 dark:text-emerald-400"
              )}>
                {type.is_taxable
                  ? "This component will be included in the employee's taxable income and subject to withholding tax according to BIR tax tables."
                  : "This component is exempt from income tax. However, verify with BIR regulations for any amount limits or conditions that may apply."}
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Tax regulations may change. Always consult with your accounting team or tax advisor.</li>
                <li>Some components may have tax-free limits (e.g., 13th month pay up to ₱90,000).</li>
                <li>Proper documentation is required for tax-exempt components.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
