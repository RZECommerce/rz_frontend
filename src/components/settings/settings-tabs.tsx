
import { Button } from "@/components/ui/button";
import {
    Work as Briefcase01Icon,
    Business as Building01Icon,
    Description as File01Icon,
} from "@mui/icons-material";

interface SettingsTabsProps {
  activeTab: "departments" | "positions" | "employment-types";
  onTabChange: (tab: "departments" | "positions" | "employment-types") => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex space-x-4 border-b">
      <Button
        variant={activeTab === "departments" ? "secondary" : "ghost"}
        onClick={() => onTabChange("departments")}
      >
        <Building01Icon className="size-5 mr-2" />
        Departments
      </Button>
      <Button
        variant={activeTab === "positions" ? "secondary" : "ghost"}
        onClick={() => onTabChange("positions")}
      >
        <Briefcase01Icon className="size-5 mr-2" />
        Positions
      </Button>
      <Button
        variant={activeTab === "employment-types" ? "secondary" : "ghost"}
        onClick={() => onTabChange("employment-types")}
      >
        <File01Icon className="size-5 mr-2" />
        Employment Types
      </Button>
    </div>
  );
}

