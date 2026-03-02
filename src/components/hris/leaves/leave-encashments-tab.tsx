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
import { leaveEncashmentService } from "@/services/leave-extensions.service";
import type { LeaveEncashment } from "@/types/leave-extensions";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusVariant: Record<string, "outline" | "default" | "destructive" | "secondary"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  paid: "secondary",
};

export function LeaveEncashmentsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["leave-encashments"],
    queryFn: () => leaveEncashmentService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaveEncashmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-encashments"] });
      toast.success("Leave encashment deleted successfully");
    },
    onError: () => toast.error("Failed to delete leave encashment"),
  });

  const encashments: LeaveEncashment[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading leave encashments...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Leave Encashments</h3>
          <p className="text-sm text-muted-foreground">Manage leave encashment requests</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Encashment</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Days Encashed</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encashments.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No leave encashments found</TableCell></TableRow>
              ) : (
                encashments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.encashment_code}</TableCell>
                    <TableCell>{e.employee ? `${e.employee.first_name} ${e.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{e.leave_type?.name || "-"}</TableCell>
                    <TableCell>{e.year}</TableCell>
                    <TableCell>{e.days_encashed}</TableCell>
                    <TableCell>{e.daily_rate.toLocaleString()}</TableCell>
                    <TableCell>{e.total_amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={statusVariant[e.status] ?? "outline"}>{e.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this leave encashment?")) deleteMutation.mutate(e.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
