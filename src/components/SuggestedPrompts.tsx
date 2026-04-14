import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

export function SuggestedPrompts({ onSelect, className }: SuggestedPromptsProps) {
  const { t } = useTranslation();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const categories = [
    {
      id: "creative",
      label: t("prompts.creative.title"),
      questions: [t("prompts.creative.text"), t("prompts.creative.text2")],
    },
    {
      id: "market",
      label: t("prompts.market.title"),
      questions: [t("prompts.market.text"), t("prompts.market.text2")],
    },
    {
      id: "research",
      label: t("prompts.research.title"),
      questions: [t("prompts.research.text"), t("prompts.research.text2")],
    },
    {
      id: "coding",
      label: t("prompts.coding.title"),
      questions: [t("prompts.coding.text"), t("prompts.coding.text2")],
    },
  ];

  const visibleQuestions = activeTag
    ? categories.find(c => c.id === activeTag)?.questions ?? []
    : categories.flatMap(c => c.questions.slice(0, 1)); // default: 1 from each

  const handleTagClick = (id: string) => {
    setActiveTag(prev => prev === id ? null : id);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Category Tags */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleTagClick(cat.id)}
            className={cn(
              "dao-tag text-sm transition-all",
              activeTag === cat.id
                ? "!bg-primary !text-primary-foreground !border-primary/80 shadow-sm"
                : ""
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
        {visibleQuestions.map((q, index) => (
          <button
            key={index}
            onClick={() => onSelect(q)}
            className="dao-question text-xs sm:text-sm text-left animate-in fade-in duration-200"
          >
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
