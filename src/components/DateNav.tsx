import type { FC } from "hono/jsx";

type DateNavProps = {
  dates: string[];
  currentDate: string;
};

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}.${m}.${d}`;
}

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
    <nav class="border-b border-border dark:border-border-dark pb-4 mb-8">
      <div class="flex items-center justify-between mb-3">
        <a
          href={olderDate ? `/${olderDate}` : "#"}
          class={`font-body text-sm transition-colors ${
            olderDate
              ? "text-sub dark:text-sub-dark hover:text-text dark:hover:text-text-dark"
              : "text-border dark:text-border-dark pointer-events-none"
          }`}
        >
          &larr; 前日
        </a>
        <time class="font-accent text-3xl font-bold tracking-tight text-text dark:text-text-dark">
          {formatDateDisplay(currentDate)}
        </time>
        <a
          href={newerDate ? `/${newerDate}` : "#"}
          class={`font-body text-sm transition-colors ${
            newerDate
              ? "text-sub dark:text-sub-dark hover:text-text dark:hover:text-text-dark"
              : "text-border dark:text-border-dark pointer-events-none"
          }`}
        >
          翌日 &rarr;
        </a>
      </div>
      <div class="flex gap-4 justify-center overflow-x-auto">
        {dates.slice(0, 10).map((date) => (
          <a
            key={date}
            href={`/${date}`}
            class={`font-body text-sm transition-colors whitespace-nowrap ${
              date === currentDate
                ? "text-accent dark:text-accent-dark border-b-2 border-accent dark:border-accent-dark pb-0.5"
                : "text-sub dark:text-sub-dark hover:text-text dark:hover:text-text-dark"
            }`}
          >
            {formatDateShort(date)}
          </a>
        ))}
      </div>
    </nav>
  );
};
