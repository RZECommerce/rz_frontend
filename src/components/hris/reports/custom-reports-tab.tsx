import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Description as File01Icon } from "@mui/icons-material";

export function CustomReportsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File01Icon className="size-5" />
            Custom Reports
          </CardTitle>
          <CardDescription>
            Create and manage custom reports based on your specific requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Custom report builder coming soon. This feature will allow you to create
              personalized reports with custom filters, columns, and data sources.
            </p>
            <Button disabled variant="outline">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
