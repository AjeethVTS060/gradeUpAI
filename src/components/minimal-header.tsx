import { Button } from "./ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";

type MinimalHeaderProps = {
  title?: string;
  currentTheme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
};

export default function MinimalHeader({ title, currentTheme, onThemeChange }: MinimalHeaderProps) {
  const [, setLocation] = useLocation();

  const toggleTheme = () => {
    if (onThemeChange && currentTheme) {
        onThemeChange(currentTheme === "light" ? "dark" : "light");
    }
  };

  return (
    <header className="p-4 flex justify-between items-center z-20 relative bg-transparent">
      <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      {title && <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h1>}
      {onThemeChange && (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
      )}
    </header>
  );
}