import { Button } from "@/components/ui/button";
import { DarkMode as Moon01Icon, WbSunny as Sun01Icon } from "@mui/icons-material";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative border-0 shadow-none flex items-center justify-center"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun01Icon
        className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon01Icon
        className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

