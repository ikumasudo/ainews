import type { FC } from "hono/jsx";
import type { Highlight, Category } from "../types.ts";

const categoryConfig: Record<Category, { label: string; color: string }> = {
  model_release: { label: "モデル", color: "bg-purple-500/20 text-accent-purple" },
  funding: { label: "資金", color: "bg-green-500/20 text-accent-green" },
  research: { label: "研究", color: "bg-blue-500/20 text-accent-blue" },
  product: { label: "製品", color: "bg-orange-500/20 text-accent-orange" },
  policy: { label: "政策", color: "bg-red-500/20 text-accent-red" },
  other: { label: "その他", color: "bg-slate-500/20 text-accent-gray" },
};

export const HighlightCard: FC<{ highlight: Highlight }> = ({ highlight }) => {
  const cat = categoryConfig[highlight.category] ?? categoryConfig.other;
  const isHigh = highlight.importance === "high";

  return (
    <div
      class={`card-gradient rounded-lg p-4 ${isHigh ? "high-border" : "medium-border"} hover:bg-surface-hover transition-colors`}
      data-category={highlight.category}
      data-importance={highlight.importance}
    >
      <div class="flex items-center gap-2 mb-2">
        <span
          class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isHigh
              ? "bg-red-500/20 text-accent-red"
              : "bg-yellow-500/20 text-accent-yellow"
          }`}
        >
          {isHigh ? "HIGH" : "MED"}
        </span>
        <span
          class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}
        >
          {cat.label}
        </span>
      </div>
      <h3 class="text-white font-semibold mb-2 leading-snug">
        {highlight.title}
      </h3>
      <p class="text-slate-400 text-sm leading-relaxed">{highlight.summary}</p>
    </div>
  );
};
