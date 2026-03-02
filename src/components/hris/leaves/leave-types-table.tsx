import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import { leaveTypeService } from "@/services/leave.service";
import type { LeaveType } from "@/types/leave";
import { Delete as Delete01Icon, Edit as Edit01Icon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface LeaveTypesTableProps {
  onEdit: (leaveType: LeaveType) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function LeaveTypesTable({
  onEdit,
  onDelete,
  isDeleting = false,
}: LeaveTypesTableProps) {
  const canManage = useHasPermission("leave-types.manage");

  const { data: leaveTypesData, isLoading } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => leaveTypeService.getAll(),
  });

  const leaveTypes = React.useMemo(() => {
    const data = leaveTypesData;
    return Array.isArray(data) ? data : [];
  }, [leaveTypesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading leave types...</p>
      </div>
    );
  }

  if (leaveTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-4">No leave types found.</p>
        {canManage && (
          <p className="text-sm text-muted-foreground">
            Click "Create Leave Type" to add your first leave type.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="min-w-[120px]">Max Days/Year</TableHead>
              <TableHead className="min-w-[200px]">Settings</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              {canManage && <TableHead className="min-w-[100px] text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveTypes.map((leaveType) => (
              <TableRow key={leaveType.id}>
                <TableCell className="font-medium">{leaveType.name}</TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="truncate block" title={leaveType.description || undefined}>
                    {leaveType.description || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  {leaveType.max_days_per_year !== null
                    ? leaveType.max_days_per_year
                    : "Unlimited"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {leaveType.requires_approval && (
                      <Badge variant="outline" className="text-xs">
                        Requires Approval
                      </Badge>
                    )}
                    {leaveType.is_paid && (
                      <Badge variant="outline" className="text-xs">
                        Paid
                      </Badge>
                    )}
                    {leaveType.can_carry_over && (
                      <Badge variant="outline" className="text-xs">
                        Carry Over
                        {leaveType.max_carry_over_days !== null &&
                          ` (${leaveType.max_carry_over_days} days)`}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={leaveType.is_active ? "default" : "secondary"}
                  >
                    {leaveType.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(leaveType)}
                        disabled={isDeleting}
                      >
                        <Edit01Icon className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${leaveType.name}"? This action cannot be undone.`
                            )
                          ) {
                            onDelete(leaveType.id);
                          }
                        }}
                        disabled={isDeleting}
                      >
                        <Delete01Icon className="size-5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
