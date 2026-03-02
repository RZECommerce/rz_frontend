import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { compensationAdjustmentService } from "@/services/compensation.service";
import type { CompensationAdjustment } from "@/types/compensation";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusVariant: Record<string, "outline" | "default" | "destructive"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
};

export function AdjustmentsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["compensation-adjustments"],
    queryFn: () => compensationAdjustmentService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => compensationAdjustmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-adjustments"] });
      toast.success("Adjustment deleted successfully");
    },
    onError: () => toast.error("Failed to delete adjustment"),
  });

  const adjustments: CompensationAdjustment[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading adjustments...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compensation Adjustments</h3>
          <p className="text-sm text-muted-foreground">Manage salary adjustments and changes</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Adjustment</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Old Salary</TableHead>
                <TableHead>New Salary</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No compensation adjustments found</TableCell></TableRow>
              ) : (
                adjustments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.adjustment_code}</TableCell>
                    <TableCell>{a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{a.adjustment_type}</TableCell>
                    <TableCell>{Number(a.old_salary).toLocaleString()}</TableCell>
                    <TableCell>{Number(a.new_salary).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={Number(a.adjustment_amount) >= 0 ? "text-green-600" : "text-red-600"}>
                        {Number(a.adjustment_amount) >= 0 ? "+" : ""}{Number(a.adjustment_amount).toLocaleString()} ({Number(a.adjustment_percentage).toFixed(1)}%)
                      </span>
                    </TableCell>
                    <TableCell>{a.effective_date}</TableCell>
                    <TableCell><Badge variant={statusVariant[a.status] ?? "outline"}>{a.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this adjustment?")) deleteMutation.mutate(a.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
