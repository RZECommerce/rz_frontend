import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InfoIcon from "@mui/icons-material/Info";
import { settingsService } from "@/services/settings.service";

export function BirTaxTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bir-tax-table"],
    queryFn: () => settingsService.getBirTaxTable(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BIR Tax Table (TRAIN Law 2023)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading tax table...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BIR Tax Table (TRAIN Law 2023)</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to load BIR tax table</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>BIR Withholding Tax Table (TRAIN Law 2023)</CardTitle>
        <CardDescription>Monthly tax brackets for employee withholding tax computation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.legend && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">{data.legend}</AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bracket</TableHead>
                <TableHead className="text-right">Compensation From</TableHead>
                <TableHead className="text-right">Compensation To</TableHead>
                <TableHead className="text-right">Base Tax</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) && data.map((bracket: any) => (
                <TableRow key={bracket.bracket}>
                  <TableCell className="font-medium">{bracket.bracket}</TableCell>
                  <TableCell className="text-right">
                    ₱{bracket.compensation_from.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    {bracket.compensation_to >= 999999999
                      ? "Above"
                      : `₱${bracket.compensation_to.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{bracket.base_tax.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">{(bracket.tax_rate * 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{bracket.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
