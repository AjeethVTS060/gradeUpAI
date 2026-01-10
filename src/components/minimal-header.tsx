import { Button } from "./ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { useLocation } from "wouter";

export function MinimalHeader() {
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="p-4 flex justify-between items-center">
      <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  );
}