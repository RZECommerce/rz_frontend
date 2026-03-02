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
import { employeeLifecycleEventService } from "@/services/employee-lifecycle.service";
import type { EmployeeLifecycleEvent } from "@/types/employee-lifecycle";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function LifecycleTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employee-lifecycle-events"],
    queryFn: () => employeeLifecycleEventService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeLifecycleEventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-lifecycle-events"] });
      toast.success("Lifecycle event deleted successfully");
    },
    onError: () => toast.error("Failed to delete lifecycle event"),
  });

  const events: EmployeeLifecycleEvent[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading lifecycle events...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Employee Lifecycle Events</h3>
          <p className="text-sm text-muted-foreground">Track employee status and role changes</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Event</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>From Status</TableHead>
                <TableHead>To Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No lifecycle events found</TableCell></TableRow>
              ) : (
                events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.employee ? `${e.employee.first_name} ${e.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{e.event_type}</TableCell>
                    <TableCell>{e.from_status || "-"}</TableCell>
                    <TableCell>{e.to_status || "-"}</TableCell>
                    <TableCell>{e.effective_at}</TableCell>
                    <TableCell>{e.created_by || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this lifecycle event?")) deleteMutation.mutate(e.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
