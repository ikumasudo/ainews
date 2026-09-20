import type { FC } from "hono/jsx";
import type { Category } from "../types.ts";

const categories: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "全て" },
  { key: "model_release", label: "モデル" },
  { key: "funding", label: "資金" },
  { key: "research", label: "研究" },
  { key: "product", label: "製品" },
  { key: "policy", label: "政策" },
  { key: "other", label: "その他" },
];

export const CategoryFilter: FC = () => {
  return (
    <div data-filters class="flex items-center gap-1 mb-8 overflow-x-auto font-body text-sm">
      {categories.map((cat, i) => (
        <div key={cat.key} class="contents">
          {i > 0 && (
            <span class="text-border dark:text-border-dark select-none">|</span>
          )}
          <button
            data-filter={cat.key}
            class={`filter-chip filter-item px-2 py-1 text-sub dark:text-sub-dark hover:text-text dark:hover:text-text-dark transition-colors cursor-pointer whitespace-nowrap ${cat.key === "all" ? "filter-active text-text dark:text-text-dark" : ""}`}
          >
            {cat.label}
          </button>
        </div>
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('[data-filters]').addEventListener('click', ({ target }) => {
              const chip = target.closest('.filter-chip');
              if (!chip) return;
              document.querySelectorAll('.filter-chip').forEach(c => {
                c.classList.toggle('filter-active', c === chip);
                c.classList.toggle('text-text', c === chip);
                c.classList.toggle('dark:text-text-dark', c === chip);
                c.classList.toggle('text-sub', c !== chip);
                c.classList.toggle('dark:text-sub-dark', c !== chip);
              });
              document.querySelectorAll('[data-category]').forEach(card => {
                card.hidden = chip.dataset.filter !== 'all' && card.dataset.category !== chip.dataset.filter;
              });
            });
          `,
        }}
      />
    </div>
  );
};
