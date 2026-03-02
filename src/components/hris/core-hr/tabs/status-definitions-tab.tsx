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
import { employeeStatusDefinitionService } from "@/services/employee-lifecycle.service";
import type { EmployeeStatusDefinition } from "@/types/employee-lifecycle";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function StatusDefinitionsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employee-status-definitions"],
    queryFn: () => employeeStatusDefinitionService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeStatusDefinitionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-status-definitions"] });
      toast.success("Status definition deleted successfully");
    },
    onError: () => toast.error("Failed to delete status definition"),
  });

  const definitions: EmployeeStatusDefinition[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading status definitions...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Employee Status Definitions</h3>
          <p className="text-sm text-muted-foreground">Manage employee status types and eligibility</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Status</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status Code</TableHead>
                <TableHead>Status Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payroll Eligible</TableHead>
                <TableHead>Leave Accrual</TableHead>
                <TableHead>Benefits</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {definitions.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No status definitions found</TableCell></TableRow>
              ) : (
                definitions.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.status_code}</TableCell>
                    <TableCell>{d.status_name}</TableCell>
                    <TableCell>{d.category}</TableCell>
                    <TableCell><Badge variant={d.payroll_eligible ? "default" : "secondary"}>{d.payroll_eligible ? "Yes" : "No"}</Badge></TableCell>
                    <TableCell><Badge variant={d.leave_accrual_eligible ? "default" : "secondary"}>{d.leave_accrual_eligible ? "Yes" : "No"}</Badge></TableCell>
                    <TableCell><Badge variant={d.benefits_eligible ? "default" : "secondary"}>{d.benefits_eligible ? "Yes" : "No"}</Badge></TableCell>
                    <TableCell>{d.order}</TableCell>
                    <TableCell><Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this status definition?")) deleteMutation.mutate(d.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
