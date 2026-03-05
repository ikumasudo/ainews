import type { FC } from "hono/jsx";
import type { Category } from "../types.ts";

const categories: { key: "all" | Category; label: string; color: string }[] = [
  { key: "all", label: "全て", color: "bg-slate-500/20 text-slate-300" },
  {
    key: "model_release",
    label: "モデル",
    color: "bg-purple-500/20 text-accent-purple",
  },
  { key: "funding", label: "資金", color: "bg-green-500/20 text-accent-green" },
  {
    key: "research",
    label: "研究",
    color: "bg-blue-500/20 text-accent-blue",
  },
  {
    key: "product",
    label: "製品",
    color: "bg-orange-500/20 text-accent-orange",
  },
  { key: "policy", label: "政策", color: "bg-red-500/20 text-accent-red" },
  { key: "other", label: "その他", color: "bg-slate-500/20 text-accent-gray" },
];

export const CategoryFilter: FC = () => {
  return (
    <div class="flex flex-wrap gap-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat.key}
          data-filter={cat.key}
          class={`filter-chip px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${cat.color} hover:opacity-80 ${cat.key === "all" ? "ring-1 ring-slate-400/50" : ""}`}
        >
          {cat.label}
        </button>
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const chips = document.querySelectorAll('.filter-chip');
              const cards = document.querySelectorAll('[data-category]');
              let active = 'all';

              chips.forEach(chip => {
                chip.addEventListener('click', () => {
                  const filter = chip.dataset.filter;
                  active = filter;

                  chips.forEach(c => c.classList.remove('ring-1', 'ring-slate-400/50'));
                  chip.classList.add('ring-1', 'ring-slate-400/50');

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
