import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import InfoIcon from "@mui/icons-material/Info";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreHoriz as MoreHorizontalIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { settingsService } from "@/services/settings.service";
import type { BirTaxBracket } from "@/types/settings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const taxBracketSchema = z.object({
  bracket: z.string().min(1, "Bracket is required"),
  compensation_from: z.number().min(0, "Must be 0 or greater"),
  compensation_to: z.number().min(0, "Must be 0 or greater"),
  base_tax: z.number().min(0, "Must be 0 or greater"),
  excess_over: z.number().min(0, "Must be 0 or greater"),
  tax_rate: z.number().min(0).max(1, "Must be between 0 and 1"),
  description: z.string().optional(),
}).refine(
  (data) => data.compensation_to >= data.compensation_from,
  {
    message: "Compensation To must be greater than or equal to Compensation From",
    path: ["compensation_to"],
  }
);

type TaxBracketFormData = z.infer<typeof taxBracketSchema>;

interface TaxComputationResult {
  grossIncome: number;
  taxableIncome: number;
  bracket: string;
  baseTax: number;
  excessAmount: number;
  excessTax: number;
  totalTax: number;
}

export function BirTaxTableEditable() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingBracket, setEditingBracket] = React.useState<string | null>(null);
  const [isComputeDialogOpen, setIsComputeDialogOpen] = React.useState(false);
  const [testIncome, setTestIncome] = React.useState<string>("");
  const [computationResult, setComputationResult] = React.useState<TaxComputationResult | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bir-tax-table"],
    queryFn: () => settingsService.getBirTaxTable(),
  });

  const taxBrackets = React.useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.tax_table || [];
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (bracketData: Omit<BirTaxBracket, 'id'>) => 
      settingsService.createBirTaxBracket(bracketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bir-tax-table"] });
      toast.success("Tax bracket added successfully");
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to add tax bracket", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ bracket, data: bracketData }: { bracket: string; data: Partial<BirTaxBracket> }) =>
      settingsService.updateBirTaxBracket(bracket, bracketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bir-tax-table"] });
      toast.success("Tax bracket updated successfully");
      setIsAddDialogOpen(false);
      setEditingBracket(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to update tax bracket", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bracket: string) => settingsService.deleteBirTaxBracket(bracket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bir-tax-table"] });
      toast.success("Tax bracket deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete tax bracket", { description: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaxBracketFormData>({
    resolver: zodResolver(taxBracketSchema),
    defaultValues: {
      bracket: "",
      compensation_from: 0,
      compensation_to: 0,
      base_tax: 0,
      excess_over: 0,
      tax_rate: 0,
      description: "",
    },
  });

  React.useEffect(() => {
    if (editingBracket) {
      const bracket = taxBrackets.find((b) => b.bracket === editingBracket);
      if (bracket) {
        reset({
          bracket: bracket.bracket,
          compensation_from: bracket.compensation_from,
          compensation_to: bracket.compensation_to,
          base_tax: bracket.base_tax,
          excess_over: bracket.excess_over,
          tax_rate: bracket.tax_rate,
          description: bracket.description || "",
        });
        setIsAddDialogOpen(true);
      }
    }
  }, [editingBracket, taxBrackets, reset]);

  const onSubmit = (formData: TaxBracketFormData) => {
    if (editingBracket) {
      updateMutation.mutate({
        bracket: editingBracket,
        data: {
          compensation_from: formData.compensation_from,
          compensation_to: formData.compensation_to,
          base_tax: formData.base_tax,
          excess_over: formData.excess_over,
          tax_rate: formData.tax_rate,
          description: formData.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        bracket: formData.bracket,
        compensation_from: formData.compensation_from,
        compensation_to: formData.compensation_to,
        base_tax: formData.base_tax,
        excess_over: formData.excess_over,
        tax_rate: formData.tax_rate,
        description: formData.description || "",
      });
    }
  };

  const handleDelete = (bracket: string) => {
    if (confirm(`Are you sure you want to delete tax bracket "${bracket}"?`)) {
      deleteMutation.mutate(bracket);
    }
  };

  const computeTax = () => {
    const income = parseFloat(testIncome);
    if (isNaN(income) || income < 0) {
      toast.error("Please enter a valid income amount");
      return;
    }

    const sortedBrackets = [...taxBrackets].sort((a, b) => a.compensation_from - b.compensation_from);
    
    let applicableBracket: BirTaxBracket | null = null;
    for (const bracket of sortedBrackets) {
      if (income >= bracket.compensation_from && income <= bracket.compensation_to) {
        applicableBracket = bracket;
        break;
      }
    }

    if (!applicableBracket) {
      toast.error("No applicable tax bracket found for this income");
      return;
    }

    const excessAmount = Math.max(0, income - applicableBracket.excess_over);
    const excessTax = excessAmount * applicableBracket.tax_rate;
    const totalTax = applicableBracket.base_tax + excessTax;

    setComputationResult({
      grossIncome: income,
      taxableIncome: income,
      bracket: applicableBracket.bracket,
      baseTax: applicableBracket.base_tax,
      excessAmount,
      excessTax,
      totalTax,
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BIR Tax Table (TRAIN Law 2023)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading tax table...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BIR Tax Table (TRAIN Law 2023)</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to load BIR tax table</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>BIR Withholding Tax Table (TRAIN Law 2023)</CardTitle>
              <CardDescription>Monthly tax brackets for employee withholding tax computation</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsComputeDialogOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <CalculateIcon className="size-4" />
                Test Computation
              </Button>
              <Button
                onClick={() => {
                  reset({
                    bracket: "",
                    compensation_from: 0,
                    compensation_to: 0,
                    base_tax: 0,
                    excess_over: 0,
                    tax_rate: 0,
                    description: "",
                  });
                  setEditingBracket(null);
                  setIsAddDialogOpen(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 gap-2"
              >
                <AddIcon className="size-4" />
                Add Bracket
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data && typeof data === 'object' && 'legend' in data && data.legend && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">{data.legend}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bracket</TableHead>
                  <TableHead className="text-right">Compensation From</TableHead>
                  <TableHead className="text-right">Compensation To</TableHead>
                  <TableHead className="text-right">Base Tax</TableHead>
                  <TableHead className="text-right">Excess Over</TableHead>
                  <TableHead className="text-right">Tax Rate</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxBrackets.length > 0 ? (
                  taxBrackets.map((bracket: BirTaxBracket) => (
                    <TableRow key={bracket.bracket}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{bracket.bracket}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(bracket.compensation_from)}
                      </TableCell>
                      <TableCell className="text-right">
                        {bracket.compensation_to >= 999999999
                          ? "Above"
                          : formatCurrency(bracket.compensation_to)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(bracket.base_tax)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(bracket.excess_over)}
                      </TableCell>
                      <TableCell className="text-right">{(bracket.tax_rate * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {bracket.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingBracket(bracket.bracket)}>
                              <EditIcon className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(bracket.bracket)}
                              className="text-destructive"
                            >
                              <DeleteIcon className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No tax brackets found. Add your first bracket to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBracket ? "Edit Tax Bracket" : "Add Tax Bracket"}</DialogTitle>
            <DialogDescription>
              {editingBracket
                ? "Update the tax bracket information"
                : "Add a new tax bracket to the withholding tax table"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bracket">
                Bracket Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bracket"
                {...register("bracket")}
                placeholder="e.g., Bracket 1"
                disabled={!!editingBracket}
              />
              {errors.bracket && <p className="text-sm text-destructive">{errors.bracket.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compensation_from">
                  Compensation From <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="compensation_from"
                  type="number"
                  step="0.01"
                  {...register("compensation_from", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.compensation_from && (
                  <p className="text-sm text-destructive">{errors.compensation_from.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="compensation_to">
                  Compensation To <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="compensation_to"
                  type="number"
                  step="0.01"
                  {...register("compensation_to", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.compensation_to && (
                  <p className="text-sm text-destructive">{errors.compensation_to.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_tax">
                  Base Tax <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="base_tax"
                  type="number"
                  step="0.01"
                  {...register("base_tax", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.base_tax && <p className="text-sm text-destructive">{errors.base_tax.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excess_over">
                  Excess Over <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="excess_over"
                  type="number"
                  step="0.01"
                  {...register("excess_over", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.excess_over && (
                  <p className="text-sm text-destructive">{errors.excess_over.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">
                Tax Rate (decimal) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                {...register("tax_rate", { valueAsNumber: true })}
                placeholder="e.g., 0.15 for 15%"
              />
              {errors.tax_rate && <p className="text-sm text-destructive">{errors.tax_rate.message}</p>}
              <p className="text-xs text-muted-foreground">Enter as decimal (e.g., 0.15 for 15%, 0.20 for 20%)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Optional description for this tax bracket"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingBracket(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingBracket ? "Update" : "Add"} Bracket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isComputeDialogOpen} onOpenChange={setIsComputeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tax Computation Calculator</DialogTitle>
            <DialogDescription>
              Test the withholding tax computation with a sample monthly income
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test_income">Monthly Gross Income</Label>
              <div className="flex gap-2">
                <Input
                  id="test_income"
                  type="number"
                  step="0.01"
                  value={testIncome}
                  onChange={(e) => setTestIncome(e.target.value)}
                  placeholder="Enter monthly income"
                  className="flex-1"
                />
                <Button onClick={computeTax} className="gap-2">
                  <CalculateIcon className="size-4" />
                  Calculate
                </Button>
              </div>
            </div>

            {computationResult && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                <h4 className="font-semibold text-sm">Computation Result</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Income:</span>
                    <span className="font-medium">{formatCurrency(computationResult.grossIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applicable Bracket:</span>
                    <Badge variant="outline">{computationResult.bracket}</Badge>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Tax:</span>
                      <span>{formatCurrency(computationResult.baseTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Excess Amount:</span>
                      <span>{formatCurrency(computationResult.excessAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax on Excess:</span>
                      <span>{formatCurrency(computationResult.excessTax)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base">
                    <span>Total Withholding Tax:</span>
                    <span className="text-teal-600">{formatCurrency(computationResult.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Net Pay:</span>
                    <span className="font-medium">
                      {formatCurrency(computationResult.grossIncome - computationResult.totalTax)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsComputeDialogOpen(false);
                setTestIncome("");
                setComputationResult(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
