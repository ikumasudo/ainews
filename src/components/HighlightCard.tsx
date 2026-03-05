import type { FC } from "hono/jsx";
import type { Highlight, Category } from "../types.ts";

const categoryLabels: Record<Category, string> = {
  model_release: "MODEL",
  funding: "FUNDING",
  research: "RESEARCH",
  product: "PRODUCT",
  policy: "POLICY",
  other: "OTHER",
};

export const HighlightCard: FC<{ highlight: Highlight; index?: number }> = ({
  highlight,
  index = 0,
}) => {
  const catLabel = categoryLabels[highlight.category] ?? categoryLabels.other;
  const isHigh = highlight.importance === "high";

  return (
    <article
      class="card-reveal card-hover border-t border-border dark:border-border-dark pt-5 pb-6"
      style={`--i: ${index}`}
      data-category={highlight.category}
      data-importance={highlight.importance}
    >
      <div class="flex items-center gap-3 mb-3">
        {isHigh && (
          <span class="inline-flex items-center gap-1 text-accent dark:text-accent-dark text-xs font-body font-medium tracking-wider">
            <span class="text-[10px]">{"\u25CF"}</span>
            重要
          </span>
        )}
        <span class="text-sub dark:text-sub-dark text-[11px] font-body font-medium tracking-[0.15em] uppercase">
          {catLabel}
        </span>
      </div>
      <h3 class={`font-display text-lg font-bold leading-snug text-text dark:text-text-dark mb-2 hover:text-accent dark:hover:text-accent-dark transition-colors ${highlight.link ? "cursor-pointer" : "cursor-default"}`}>
        {highlight.link ? (
          <a href={highlight.link} target="_blank" rel="noopener">
            {highlight.title}
          </a>
        ) : (
          highlight.title
        )}
      </h3>
      <p class="font-body text-sm text-sub dark:text-sub-dark leading-relaxed">
        {highlight.summary}
      </p>
    </article>
  );
};
