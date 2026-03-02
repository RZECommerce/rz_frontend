
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { holidayService } from "@/services/holiday.service";
import type { Holiday } from "@/types/holiday";
import {
    Cancel as Cancel01Icon,
    CheckCircle as CheckmarkCircle01Icon,
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    MoreHoriz as MoreHorizontalIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface HolidaysTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function HolidaysTable({
  onEdit,
  onDelete,
  isDeleting = false,
}: HolidaysTableProps) {
  const { data: holidaysData, isLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => holidayService.getAll(),
  });

  const holidays = holidaysData?.data || [];

  const getTypeLabel = (type: Holiday["type"]) => {
    switch (type) {
      case "regular":
        return "Regular Holiday";
      case "special_non_working":
        return "Special Non-Working";
      default:
        return type;
    }
  };

  const getTypeColor = (type: Holiday["type"]) => {
    switch (type) {
      case "regular":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "special_non_working":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Loading holidays...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No holidays found. Create your first holiday to get started.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell className="font-medium">{holiday.name}</TableCell>
              <TableCell>
                {format(new Date(holiday.date), "PPP")}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    getTypeColor(holiday.type)
                  )}
                >
                  {getTypeLabel(holiday.type)}
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {holiday.description || "—"}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    holiday.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  )}
                >
                  {holiday.is_active ? (
                    <>
                      <CheckmarkCircle01Icon
                        className="size-5 mr-1"
                      />
                      Active
                    </>
                  ) : (
                    <>
                      <Cancel01Icon
                        className="size-5 mr-1"
                      />
                      Inactive
                    </>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontalIcon className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(holiday.id)}>
                      <Edit01Icon className="size-5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(holiday.id)}
                      disabled={isDeleting}
                      className="text-destructive"
                    >
                      <Delete01Icon className="size-5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

