import { useState, KeyboardEvent } from "react";
import { ArrowRight, Loader2, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder: string;
  variant?: "landing" | "chat";
  webSearchEnabled?: boolean;
  onWebSearchToggle?: () => void;
}

export function SearchBar({ onSubmit, isLoading, placeholder, variant = "landing", webSearchEnabled, onWebSearchToggle }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn(
      "relative w-full rounded-xl bg-background border transition-all duration-200",
      variant === "landing" ? "shadow-large border-border/50 hover:border-border" : "shadow-soft border-border",
      isLoading && "opacity-50"
    )}>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent pr-12 sm:pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed",
          variant === "landing" ? "px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg" : "px-4 py-3 text-base"
        )}
      />

      {/* Bottom toolbar with web search toggle */}
      {onWebSearchToggle && (
        <div className="flex items-center px-3 sm:px-4 pb-2">
          <button
            type="button"
            onClick={onWebSearchToggle}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
              webSearchEnabled
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{t("search.toggle")}</span>
            {webSearchEnabled && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground leading-none">
                ON
              </span>
            )}
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!query.trim() || isLoading}
        className={cn(
          "absolute right-2 sm:right-3 top-3 sm:top-3.5 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-all duration-200",
          query.trim() && !isLoading
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium active:scale-95"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>
    </div>
  );
}
