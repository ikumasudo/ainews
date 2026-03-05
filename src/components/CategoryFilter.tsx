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
    <div class="flex items-center gap-1 mb-8 overflow-x-auto font-body text-sm">
      {categories.map((cat, i) => (
        <>
          {i > 0 && (
            <span class="text-border dark:text-border-dark select-none">|</span>
          )}
          <button
            key={cat.key}
            data-filter={cat.key}
            class={`filter-chip filter-item px-2 py-1 text-sub dark:text-sub-dark hover:text-text dark:hover:text-text-dark transition-colors cursor-pointer whitespace-nowrap ${cat.key === "all" ? "filter-active text-text dark:text-text-dark" : ""}`}
          >
            {cat.label}
          </button>
        </>
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const chips = document.querySelectorAll('.filter-chip');
              const cards = document.querySelectorAll('[data-category]');

              chips.forEach(chip => {
                chip.addEventListener('click', () => {
                  const filter = chip.dataset.filter;

                  chips.forEach(c => {
                    c.classList.remove('filter-active', 'text-text', 'dark:text-text-dark');
                    c.classList.add('text-sub', 'dark:text-sub-dark');
                  });
                  chip.classList.add('filter-active', 'text-text', 'dark:text-text-dark');
                  chip.classList.remove('text-sub', 'dark:text-sub-dark');

                  cards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                      card.style.display = '';
                    } else {
                      card.style.display = 'none';
                    }
                  });
                });
              });
            });
          `,
        }}
      />
    </div>
  );
};
