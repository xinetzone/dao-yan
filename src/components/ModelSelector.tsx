import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { MODEL_OPTIONS, type ModelOption } from "@/data/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModelId, onModelChange, disabled }: ModelSelectorProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh-CN";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = MODEL_OPTIONS.find(m => m.id === selectedModelId) ?? MODEL_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all border",
          "text-muted-foreground hover:text-foreground border-transparent hover:border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isZh ? selected.nameZh : selected.name}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 w-56 rounded-md border-2 border-foreground/15 bg-card shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="p-1.5">
            {MODEL_OPTIONS.map((model: ModelOption) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex flex-col gap-0.5 px-3 py-2 rounded text-left transition-colors",
                  model.id === selectedModelId
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                <span className="text-xs font-semibold">
                  {isZh ? model.nameZh : model.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isZh ? model.descriptionZh : model.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
