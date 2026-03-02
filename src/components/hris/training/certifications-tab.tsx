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
import { certificationExpiryTrackingService } from "@/services/skills.service";
import type { CertificationExpiryTracking } from "@/types/skills";
import {
  Add as Add01Icon,
  Delete as Delete01Icon,
  MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as React from "react";

const statusVariant: Record<string, "default" | "outline" | "destructive"> = {
  active: "default",
  expiring_soon: "outline",
  expired: "destructive",
};

export function CertificationsTab() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["certification-expiry"],
    queryFn: () => certificationExpiryTrackingService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => certificationExpiryTrackingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certification-expiry"] });
      toast.success("Certification deleted successfully");
    },
    onError: () => toast.error("Failed to delete certification"),
  });

  const certifications: CertificationExpiryTracking[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading certifications...</div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Certifications</h3>
          <p className="text-sm text-muted-foreground">Track employee certification expiry</p>
        </div>
        <Button className="gap-2"><Add01Icon className="size-5" />Add Certification</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Certification Name</TableHead>
                <TableHead>Issuing Org</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Until Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifications.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No certifications found</TableCell></TableRow>
              ) : (
                certifications.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.employee ? `${c.employee.first_name} ${c.employee.last_name}` : "-"}</TableCell>
                    <TableCell>{c.certification_name}</TableCell>
                    <TableCell>{c.issuing_organization || "-"}</TableCell>
                    <TableCell>{c.issue_date || "-"}</TableCell>
                    <TableCell>{c.expiry_date}</TableCell>
                    <TableCell>{c.days_until_expiry ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[c.status] ?? "outline"}
                        className={c.status === "expiring_soon" ? "border-yellow-500 text-yellow-700" : undefined}
                      >
                        {c.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontalIcon className="size-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this certification?")) deleteMutation.mutate(c.id); }}><Delete01Icon className="size-5 mr-2" />Delete</DropdownMenuItem>
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
