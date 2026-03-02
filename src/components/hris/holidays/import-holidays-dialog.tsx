
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (year: number) => void;
  isImporting: boolean;
}

export function ImportHolidaysDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
}: ImportHolidaysDialogProps) {
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    // Generate years from 2020 to 5 years in the future
    for (let i = 2020; i <= currentYear + 5; i++) {
      yearsList.push(i);
    }
    return yearsList;
  }, []);

  React.useEffect(() => {
    if (open) {
      setSelectedYear(new Date().getFullYear());
    }
  }, [open]);

  const handleImport = () => {
    onImport(selectedYear);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Import Philippine Holidays
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Import public holidays from the official Philippine holidays API. 
            This will only add holidays that don't already exist (by date). 
            Your manually created holidays will be preserved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium">
              Year <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(value ? parseInt(value, 10) : new Date().getFullYear())}
            >
              <SelectTrigger id="year" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
            <p className="font-medium">Note:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Holidays are imported from Nager.Date API</li>
              <li>Only new holidays (by date) will be added</li>
              <li>Existing holidays will be skipped</li>
              <li>All holidays are imported as "Regular" type by default</li>
              <li>You can edit them later to change the type if needed</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
          >
            {isImporting ? "Importing..." : "Import Holidays"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

