import DownloadIcon from "@mui/icons-material/Download";
import FilterIcon from "@mui/icons-material/Filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateOTButton } from "./generate-ot-button";

interface OvertimeApprovalHeaderProps {
  onExport: () => void;
}

export function OvertimeApprovalHeader({ onExport }: OvertimeApprovalHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Overtime Approvals</CardTitle>
            <p className="text-muted-foreground">
              Manage and approve employee overtime requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GenerateOTButton />
            <Button variant="outline" size="sm" onClick={onExport}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
