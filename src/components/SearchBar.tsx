import { useState, KeyboardEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder: string;
  variant?: "landing" | "chat";
}

export function SearchBar({ onSubmit, isLoading, placeholder, variant = "landing" }: SearchBarProps) {
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
        rows={variant === "landing" ? 1 : 1}
        className={cn(
          "w-full resize-none bg-transparent pr-12 sm:pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed",
          variant === "landing" ? "px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg" : "px-4 py-3 text-base"
        )}
      />
      <button
        onClick={handleSubmit}
        disabled={!query.trim() || isLoading}
        className={cn(
          "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-all duration-200",
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
