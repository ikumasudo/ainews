
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Design Context

### Users
AI業界のプロフェッショナル（エンジニア、リサーチャー、プロダクトマネージャー）が、毎日の習慣としてAIニュースをチェックする。朝のコーヒーを飲みながら、あるいは業務の合間に素早く最新動向を把握するのが主な利用シーン。情報の正確さと一覧性が最優先。

### Brand Personality
**知的・洗練・静謐**

高品質な日本の新聞・雑誌の紙面を思わせる、落ち着いたトーン。派手さや遊び心よりも、信頼感と品格を重視する。情報を邪魔しない、控えめで美しいデザイン。

### Aesthetic Direction
- **Visual tone**: Editorial / newspaper-inspired, typography-driven
- **Palette**: Warm neutral (cream/dark brown) with single vermillion (朱色) accent
- **Typography**: Shippori Mincho B1 (display), Noto Sans JP (body), Cormorant Garamond (accent/dates)
- **Theme**: Light & dark mode, class-based switching
- **Texture**: Subtle paper grain overlay (3% opacity SVG noise)
- **Anti-patterns**: Generic AI aesthetics (gradients, neon accents, emoji icons, colored pill badges, purple/blue palettes). Avoid anything that looks like a typical tech blog or SaaS dashboard.

### Design Principles

1. **Typography first** — Let typefaces and hierarchy carry the design. Avoid decorative elements where type alone can communicate structure and importance.
2. **Quiet confidence** — Every element should feel intentional and restrained. If in doubt, remove rather than add. White space is a feature, not a gap to fill.
3. **Information density without clutter** — Professionals want to scan efficiently. Prioritize scannability through clear hierarchy, not through visual noise.
4. **Warmth through materiality** — Use warm neutrals, paper texture, and serif typography to evoke the tactile quality of print media, contrasting the cold digital norm.
5. **Single accent discipline** — Vermillion (朱色) is the only accent color. Use it sparingly for maximum impact — importance markers and active states only.
