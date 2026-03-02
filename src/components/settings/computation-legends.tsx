import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapse } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { settingsService } from "@/services/settings.service";

export function ComputationLegends() {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["computation-legends"],
    queryFn: () => settingsService.getComputationLegends(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll Computation Explanations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading computation legends...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll Computation Explanations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to load computation legends</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatTitle = (key: string): string => {
    return key
      .replace("computation_legend_", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Computation Explanations</CardTitle>
        <CardDescription>How each payroll component is calculated</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data?.map((legend, index) => (
            <div key={legend.key} className="border rounded-lg">
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <InfoIcon sx={{ fontSize: 16 }} className="text-muted-foreground" />
                  <span className="font-medium">{formatTitle(legend.key)}</span>
                </div>
                <ExpandMoreIcon
                  sx={{ fontSize: 20 }}
                  className={`transition-transform ${expandedIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              <Collapse in={expandedIndex === index}>
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-sm text-muted-foreground">{legend.description}</p>
                  <Alert>
                    <AlertDescription className="text-sm">{legend.explanation}</AlertDescription>
                  </Alert>
                </div>
              </Collapse>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
