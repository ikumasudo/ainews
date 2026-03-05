import type { FC } from "hono/jsx";

type LayoutProps = {
  title?: string;
  children: any;
};

export const Layout: FC<LayoutProps> = ({ title, children }) => {
  const pageTitle = title
    ? `${title} | AI News ハイライト`
    : "AI News ハイライト";

  return (
    <html lang="ja" class="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      surface: { DEFAULT: '#0f172a', card: '#1e293b', hover: '#334155' },
                      accent: { purple: '#a78bfa', blue: '#60a5fa', green: '#34d399', orange: '#fb923c', red: '#f87171', yellow: '#fbbf24', gray: '#94a3b8' }
                    }
                  }
                }
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { background: #0f172a; color: #e2e8f0; }
              .card-gradient { background: linear-gradient(135deg, #1e293b 0%, #1a2332 100%); }
              .high-border { border-left: 3px solid #f87171; }
              .medium-border { border-left: 3px solid #fbbf24; }
            `,
          }}
        />
      </head>
      <body class="min-h-screen">
        <header class="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10 bg-surface/80">
          <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2 text-xl font-bold text-white hover:text-accent-purple transition-colors">
              <span class="text-2xl">⚡</span>
              <span>AI News ハイライト</span>
            </a>
            <button
              id="theme-toggle"
              class="p-2 rounded-lg hover:bg-surface-hover transition-colors text-slate-400 hover:text-white"
              aria-label="テーマ切替"
            >
              🌙
            </button>
          </div>
        </header>
        <main class="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer class="border-t border-slate-700/50 mt-12">
          <div class="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
            <p>
              データソース:{" "}
              <a
                href="https://news.smol.ai/"
                class="text-accent-blue hover:underline"
                target="_blank"
                rel="noopener"
              >
                news.smol.ai
              </a>
              {" "}| Workers AIで自動抽出
            </p>
          </div>
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const toggle = document.getElementById('theme-toggle');
              const html = document.documentElement;
              toggle.addEventListener('click', () => {
                html.classList.toggle('dark');
                toggle.textContent = html.classList.contains('dark') ? '🌙' : '☀️';
              });
            `,
          }}
        />
      </body>
    </html>
  );
};
