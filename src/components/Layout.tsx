import type { FC } from "hono/jsx";

type LayoutProps = {
  title?: string;
  children: any;
};

export const Layout: FC<LayoutProps> = ({ title, children }) => {
  const pageTitle = title
    ? `${title} | AI News`
    : "AI News";

  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Noto+Sans+JP:wght@400;500&family=Shippori+Mincho+B1:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');if(s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})();`,
          }}
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      bg: { DEFAULT: '#FAF7F2', dark: '#1A1814' },
                      surface: { DEFAULT: '#FFFFFF', dark: '#242018' },
                      text: { DEFAULT: '#1A1814', dark: '#F0EBE3' },
                      sub: { DEFAULT: '#6B6560', dark: '#9B9590' },
                      accent: '#C23B22',
                      'accent-dark': '#D94F3A',
                      border: { DEFAULT: '#E8E0D8', dark: '#3A3430' },
                    },
                    fontFamily: {
                      display: ['"Shippori Mincho B1"', 'serif'],
                      body: ['"Noto Sans JP"', 'sans-serif'],
                      accent: ['"Cormorant Garamond"', 'serif'],
                    },
                  }
                }
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                background: #FAF7F2;
                color: #1A1814;
                font-family: 'Noto Sans JP', sans-serif;
              }
              .dark body {
                background: #1A1814;
                color: #F0EBE3;
              }

              /* Grain overlay */
              body::before {
                content: '';
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 9999;
                opacity: 0.03;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                background-repeat: repeat;
                background-size: 256px 256px;
              }

              /* Card reveal animation */
              @keyframes fadeUp {
                from {
                  opacity: 0;
                  transform: translateY(12px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .card-reveal {
                opacity: 0;
                animation: fadeUp 0.4s ease-out forwards;
                animation-delay: calc(var(--i) * 0.06s);
              }

              /* Card hover */
              .card-hover {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }
              .card-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
              }
              .dark .card-hover:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              }

              /* Filter underline animation */
              .filter-item {
                position: relative;
              }
              .filter-item::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 100%;
                height: 2px;
                background: #C23B22;
                transform: scaleX(0);
                transform-origin: left;
                transition: transform 0.25s ease;
              }
              .dark .filter-item::after {
                background: #D94F3A;
              }
              .filter-item:hover::after,
              .filter-active::after {
                transform: scaleX(1);
              }
            `,
          }}
        />
      </head>
      <body class="min-h-screen font-body">
        <header class="border-b border-border dark:border-border-dark">
          <div class="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
            <a href="/" class="flex items-baseline gap-2 group">
              <span class="font-accent text-2xl font-bold tracking-tight text-text dark:text-text-dark">
                AI News
              </span>
              <span class="font-display text-sm font-semibold text-sub dark:text-sub-dark">
                ハイライト
              </span>
            </a>
            <button
              id="theme-toggle"
              class="p-2 text-sub dark:text-sub-dark hover:text-text dark:hover:text-text-dark transition-colors"
              aria-label="テーマ切替"
            >
              <svg id="theme-icon-sun" class="w-5 h-5 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg id="theme-icon-moon" class="w-5 h-5 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
          </div>
        </header>
        <main class="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <footer class="border-t border-border dark:border-border-dark mt-16">
          <div class="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-sub dark:text-sub-dark font-body tracking-wide">
            <p>
              <a
                href="https://news.smol.ai/"
                class="hover:text-accent dark:hover:text-accent-dark transition-colors"
                target="_blank"
                rel="noopener"
              >
                news.smol.ai
              </a>
              {" "}&mdash;{" "}Workers AIで自動抽出
            </p>
          </div>
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const toggle = document.getElementById('theme-toggle');
              const html = document.documentElement;
              const iconSun = document.getElementById('theme-icon-sun');
              const iconMoon = document.getElementById('theme-icon-moon');
              function updateIcon() {
                const isDark = html.classList.contains('dark');
                iconSun.classList.toggle('hidden', isDark);
                iconMoon.classList.toggle('hidden', !isDark);
              }
              updateIcon();
              toggle.addEventListener('click', () => {
                html.classList.toggle('dark');
                localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
                updateIcon();
              });
            `,
          }}
        />
      </body>
    </html>
  );
};
