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
import { performanceGoalService } from "@/services/performance.service";
import type { PerformanceGoal } from "@/types/performance";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function GoalsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["performance-goals"],
    queryFn: () => performanceGoalService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => performanceGoalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-goals"] });
      toast.success("Goal deleted successfully");
    },
    onError: () => toast.error("Failed to delete goal"),
  });

  const goals: PerformanceGoal[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading goals...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Goals</h3>
          <p className="text-sm text-muted-foreground">Manage employee performance goals</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Goal</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Goal Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No performance goals found</TableCell></TableRow>
              ) : (
                goals.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.goal_code}</TableCell>
                    <TableCell>{g.employee ? `${g.employee.first_name} ${g.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{g.goal_type?.name || "-"}</TableCell>
                    <TableCell>{g.title}</TableCell>
                    <TableCell>{g.start_date}</TableCell>
                    <TableCell>{g.due_date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${g.progress_percent}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{g.progress_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={g.status === "completed" ? "default" : g.status === "cancelled" ? "destructive" : "secondary"}>{g.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this goal?")) deleteMutation.mutate(g.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
