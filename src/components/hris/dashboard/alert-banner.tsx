
import { CalendarMonth as Calendar01Icon } from "@mui/icons-material";

export function AlertBanner() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
      <div className="flex items-start sm:items-center gap-4">
        <Calendar01Icon className="size-5 text-muted-foreground" />
        <p className="text-sm sm:text-base leading-relaxed">
          <span className="text-muted-foreground">You have </span>
          <span className="font-semibold">12 Pending Leave Requests,</span>
          <span> and </span>
          <span className="font-semibold">5 Overtime Approvals</span>
          <span className="text-muted-foreground"> that need action!</span>
        </p>
      </div>
    </div>
  );
}

