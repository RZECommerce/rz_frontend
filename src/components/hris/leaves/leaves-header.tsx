
import { FullPageHeader } from "@/components/layout/full-page-header";

interface LeavesHeaderProps {
  onExport?: () => void | Promise<void>;
}

export function LeavesHeader({ onExport }: LeavesHeaderProps) {
  return (
    <FullPageHeader
      showExport={true}
      exportLabel="Export"
      onExport={onExport}
      showNew={false}
    />
  );
}

