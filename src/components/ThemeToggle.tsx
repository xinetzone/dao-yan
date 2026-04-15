import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getStoredTheme, applyTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh-CN";
  const [theme, setTheme] = useState<"light" | "dark">(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-foreground"
      title={theme === "light"
        ? (isZh ? "切换深色模式" : "Switch to dark mode")
        : (isZh ? "切换浅色模式" : "Switch to light mode")}
    >
      {theme === "light"
        ? <Moon className="h-4 w-4 shrink-0" />
        : <Sun className="h-4 w-4 shrink-0" />
      }
      <span className="text-sm">
        {theme === "light"
          ? (isZh ? "深色模式" : "Dark mode")
          : (isZh ? "浅色模式" : "Light mode")}
      </span>
    </Button>
  );
}
