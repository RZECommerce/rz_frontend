import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { settingsService } from "@/services/settings.service";

export function HolidayRatesTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["holiday-rates"],
    queryFn: () => settingsService.getHolidayRates(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DOLE Holiday Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading holiday rates...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DOLE Holiday Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to load holiday rates</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DOLE Holiday Pay Rate Multipliers</CardTitle>
        <CardDescription>
          Philippine Department of Labor and Employment (DOLE) prescribed rates for holiday pay computation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day Type</TableHead>
                <TableHead className="text-right">Rate Multiplier</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((rate) => (
                <TableRow key={rate.key}>
                  <TableCell className="font-medium">{rate.description}</TableCell>
                  <TableCell className="text-right">{rate.rate.toFixed(2)}x</TableCell>
                  <TableCell className="text-right">{(rate.rate * 100).toFixed(0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
