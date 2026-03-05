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
  return (
    <nav class="border-b border-border dark:border-border-dark pb-4 mb-8">
      <div class="flex items-center justify-center mb-3">
        <time class="font-accent text-3xl font-bold tracking-tight text-text dark:text-text-dark">
          {formatDateDisplay(currentDate)}
        </time>
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
