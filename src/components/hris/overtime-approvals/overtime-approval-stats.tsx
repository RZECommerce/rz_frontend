import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overtimeRequestService } from "@/services/overtime-request.service";
import type { OvertimeRequestFilters } from "@/types/overtime-request";

interface OvertimeApprovalStatsProps {
  filters: OvertimeRequestFilters;
}

export function OvertimeApprovalStats({ filters }: OvertimeApprovalStatsProps) {
  const { data: pendingData } = useQuery({
    queryKey: ["overtime-requests", "stats", "pending"],
    queryFn: () => 
      overtimeRequestService.getAll({
        ...filters,
        status: "pending",
        per_page: 1,
        page: 1,
      }),
  });

  const { data: approvedData } = useQuery({
    queryKey: ["overtime-requests", "stats", "approved"],
    queryFn: () => 
      overtimeRequestService.getAll({
        ...filters,
        status: "approved",
        per_page: 1,
        page: 1,
      }),
  });

  const { data: rejectedData } = useQuery({
    queryKey: ["overtime-requests", "stats", "rejected"],
    queryFn: () => 
      overtimeRequestService.getAll({
        ...filters,
        status: "rejected",
        per_page: 1,
        page: 1,
      }),
  });

  const pendingCount = pendingData?.total || 0;
  const approvedCount = approvedData?.total || 0;
  const rejectedCount = rejectedData?.total || 0;
  const totalCount = pendingCount + approvedCount + rejectedCount;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            All overtime requests
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">
            Requests awaiting approval
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <p className="text-xs text-muted-foreground">
            Approved overtime requests
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <p className="text-xs text-muted-foreground">
            Rejected overtime requests
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
