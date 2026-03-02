
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
import type { Department, EmploymentType, Position } from "@/types/employee";
import { Delete as Delete01Icon, Edit as Edit01Icon } from "@mui/icons-material";

interface SettingsTableProps {
  activeTab: "departments" | "positions" | "employment-types";
  data: Department[] | Position[] | EmploymentType[];
  isLoading: boolean;
  onEdit: (item: Department | Position | EmploymentType) => void;
  onDelete: (id: string) => void;
}

export function SettingsTable({
  activeTab,
  data,
  isLoading,
  onEdit,
  onDelete,
}: SettingsTableProps) {
  const canManage = useHasPermission("settings.manage");

  const getCode = (item: Department | Position | EmploymentType): string => {
    if (activeTab === "departments") {
      return (item as Department).department_code;
    } else if (activeTab === "positions") {
      return (item as Position).position_code;
    } else {
      return (item as EmploymentType).employment_type_code;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={canManage ? 5 : 4}
                className="h-24 text-center text-muted-foreground"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canManage ? 5 : 4}
                className="h-24 text-center text-muted-foreground"
              >
                No items found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item: Department | Position | EmploymentType) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{getCode(item)}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description || "-"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {item.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Edit01Icon className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                      >
                        <Delete01Icon className="size-5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

