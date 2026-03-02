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
import { performanceIndicatorService } from "@/services/performance.service";
import type { PerformanceIndicator } from "@/types/performance";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function IndicatorsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["performance-indicators"],
    queryFn: () => performanceIndicatorService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => performanceIndicatorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-indicators"] });
      toast.success("Indicator deleted successfully");
    },
    onError: () => toast.error("Failed to delete indicator"),
  });

  const indicators: PerformanceIndicator[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading indicators...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Indicators</h3>
          <p className="text-sm text-muted-foreground">Manage performance measurement indicators</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Indicator</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Scoring Method</TableHead>
                <TableHead>Min Score</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead>Default Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicators.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No performance indicators found</TableCell></TableRow>
              ) : (
                indicators.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.indicator_code}</TableCell>
                    <TableCell>{i.name}</TableCell>
                    <TableCell>{i.scoring_method}</TableCell>
                    <TableCell>{i.min_score}</TableCell>
                    <TableCell>{i.max_score}</TableCell>
                    <TableCell>{i.default_weight}</TableCell>
                    <TableCell><Badge variant={i.is_active ? "default" : "secondary"}>{i.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this indicator?")) deleteMutation.mutate(i.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
