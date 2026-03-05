import type { FC } from "hono/jsx";

type DateNavProps = {
  dates: string[];
  currentDate: string;
};

function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m!)}/${parseInt(d!)}`;
}

export const DateNav: FC<DateNavProps> = ({ dates, currentDate }) => {
  const currentIndex = dates.indexOf(currentDate);
  const newerDate = currentIndex > 0 ? dates[currentIndex - 1] : null;
  const olderDate =
    currentIndex < dates.length - 1 ? dates[currentIndex + 1] : null;

  return (
    <nav class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      <a
        href={olderDate ? `/${olderDate}` : "#"}
        class={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          olderDate
            ? "bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-hover text-slate-600 dark:text-slate-300"
            : "bg-slate-100 dark:bg-surface-card/50 text-slate-400 dark:text-slate-600 pointer-events-none"
        }`}
      >
        ◀ 前
      </a>
      <div class="flex gap-1.5 overflow-x-auto">
        {dates.slice(0, 10).map((date) => (
          <a
            key={date}
            href={`/${date}`}
            class={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              date === currentDate
                ? "bg-accent-purple/20 text-accent-purple ring-1 ring-accent-purple/50"
                : "bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-hover text-slate-500 dark:text-slate-400"
            }`}
          >
            {formatDateShort(date)}
          </a>
        ))}
      </div>
      <a
        href={newerDate ? `/${newerDate}` : "#"}
        class={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          newerDate
            ? "bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-hover text-slate-600 dark:text-slate-300"
            : "bg-slate-100 dark:bg-surface-card/50 text-slate-400 dark:text-slate-600 pointer-events-none"
        }`}
      >
        次 ▶
      </a>
    </nav>
  );
};
