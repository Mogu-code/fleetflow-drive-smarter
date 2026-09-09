import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="relative h-8 w-8 px-0 text-muted-foreground hover:text-foreground transition-all duration-200"
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / System)`}
    >
      {theme === "light" && <Sun className="h-4 w-4 text-warning animate-rise" />}
      {theme === "dark" && <Moon className="h-4 w-4 text-primary animate-rise" />}
      {theme === "system" && <Monitor className="h-4 w-4 text-muted-foreground animate-rise" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
