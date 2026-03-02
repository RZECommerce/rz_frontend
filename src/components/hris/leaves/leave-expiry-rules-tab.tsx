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
import { leaveExpiryRuleService } from "@/services/leave-extensions.service";
import type { LeaveExpiryRule } from "@/types/leave-extensions";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function LeaveExpiryRulesTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["leave-expiry-rules"],
    queryFn: () => leaveExpiryRuleService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaveExpiryRuleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-expiry-rules"] });
      toast.success("Leave expiry rule deleted successfully");
    },
    onError: () => toast.error("Failed to delete leave expiry rule"),
  });

  const rules: LeaveExpiryRule[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading leave expiry rules...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Leave Expiry Rules</h3>
          <p className="text-sm text-muted-foreground">Manage leave expiry and forfeiture rules</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Rule</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Expiry Type</TableHead>
                <TableHead>Expiry Days</TableHead>
                <TableHead>Grace Period</TableHead>
                <TableHead>Action on Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No leave expiry rules found</TableCell></TableRow>
              ) : (
                rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.leave_type?.name || "-"}</TableCell>
                    <TableCell>{r.expiry_type}</TableCell>
                    <TableCell>{r.expiry_days_after_accrual ?? "-"}</TableCell>
                    <TableCell>{r.grace_period_value ? `${r.grace_period_value} ${r.grace_period_type || ""}` : "-"}</TableCell>
                    <TableCell>{r.action_on_expiry}</TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this leave expiry rule?")) deleteMutation.mutate(r.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
