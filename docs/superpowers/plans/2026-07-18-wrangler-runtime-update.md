# Wrangler・Workersランタイム更新実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wranglerを4.112.0、Workersの互換性日付を2026-07-18へ更新し、既存アプリケーションのローカル動作を維持する。

**Architecture:** miseで固定済みのBun 1.3.14を使って開発依存とロックファイルを更新する。Workers設定では互換性日付だけを変更し、既存のバインディング・Cron・互換性フラグを保持したまま、生成型・型検査・dry-runビルド・HTTP応答で更新を検証する。

**Tech Stack:** mise、Bun 1.3.14、Wrangler 4.112.0、TypeScript 5.9.3、Cloudflare Workers、Hono、D1、KV

## 全体制約

- Wranglerの開発依存は`^4.112.0`とする。
- `compatibility_date`は`2026-07-18`とする。
- `nodejs_compat`、D1、KV、Cron設定は変更しない。
- 本番デプロイ、リモートリソース変更、Worker Secret変更は行わない。
- `.dev.vars`の値を表示またはGit管理対象へ追加しない。
- 既存の未コミット変更を保持する。

---

### Task 1: Wrangler依存とWorkers互換性日付の更新

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `wrangler.jsonc`

**Interfaces:**
- Consumes: miseで有効化されるBun 1.3.14、既存のWrangler 4.69.0設定
- Produces: Wrangler 4.112.0と`compatibility_date` 2026-07-18

- [ ] **Step 1: Wrangler依存を更新する**

Run: `mise exec -- bun add --dev wrangler@^4.112.0`

Expected: `package.json`の`wrangler`が`^4.112.0`になり、`bun.lock`がWrangler 4.112.0向けに更新される。

- [ ] **Step 2: Workers互換性日付を更新する**

`wrangler.jsonc`の該当行を次の内容に変更する。

```jsonc
"compatibility_date": "2026-07-18",
```

- [ ] **Step 3: 対象設定以外が不変であることを確認する**

Run: `git diff -- package.json wrangler.jsonc`

Expected: Wranglerのバージョンと`compatibility_date`だけが変更され、`nodejs_compat`、D1、KV、Cron設定に差分がない。

- [ ] **Step 4: インストールされたWranglerを確認する**

Run: `mise exec -- bunx wrangler --version`

Expected: `4.112.0`

### Task 2: 生成型・型検査・ビルドの検証

**Files:**
- Regenerate: `worker-configuration.d.ts`
- Create locally, ignored: `dist/`

**Interfaces:**
- Consumes: Task 1が提供するWrangler 4.112.0と互換性日付2026-07-18
- Produces: 更新後ランタイムと一致するWorkers型、および検証済みWorkerバンドル

- [ ] **Step 1: Workers型を再生成する**

Run: `mise exec -- bun run types`

Expected: `worker-configuration.d.ts`の生成情報がWrangler 4.112.0のランタイムと`2026-07-18 nodejs_compat`を反映する。

- [ ] **Step 2: TypeScript型検査を実行する**

Run: `mise exec -- bunx tsc --noEmit`

Expected: 出力なし、終了コード0。

- [ ] **Step 3: dry-runビルドを実行する**

Run: `mise exec -- bun run build`

Expected: Cloudflareへデプロイせず、Wranglerが終了コード0でWorkerバンドルを生成する。

### Task 3: ローカルHTTP動作と最終差分の検証

**Files:**
- Consume: `.dev.vars`
- Consume: `.wrangler/`

**Interfaces:**
- Consumes: Task 2で検証したWorkerバンドルとローカルD1・KV
- Produces: Wrangler 4.112.0上でのHTTP 200応答と、秘密情報を含まない最終差分

- [ ] **Step 1: ローカルWorkerを起動する**

Run: `mise exec -- bun run dev -- --port 8787`

Expected: Wrangler 4.112.0がD1、KV、`OPENROUTER_API_KEY`をローカルバインディングとして表示し、`http://localhost:8787`で待ち受ける。

- [ ] **Step 2: リダイレクト後のHTML応答を確認する**

Run: `curl --location --fail --silent --show-error --output /tmp/ainews-wrangler-update.html --write-out '%{http_code} %{content_type} %{size_download}\n' http://127.0.0.1:8787/`

Expected: HTTP 200、`text/html`、0より大きいレスポンスサイズ。

- [ ] **Step 3: 開発サーバーを終了する**

Wranglerの対話セッションへ`x`を送り、正常終了を確認する。

- [ ] **Step 4: 最終検証を行う**

Run: `git diff --check && git check-ignore .dev.vars node_modules .wrangler dist && git status --short`

Expected: 空白エラーがなく、秘密情報・依存・ローカル状態・ビルド成果物が無視され、更新対象と既存の意図した未コミットファイルだけが表示される。

- [ ] **Step 5: 更新差分をコミットする**

```bash
git add package.json bun.lock wrangler.jsonc worker-configuration.d.ts docs/superpowers/plans/2026-07-18-wrangler-runtime-update.md
git commit -m "chore: update Wrangler and Workers runtime"
```

Expected: Wrangler更新、互換性日付、生成型、実装計画だけがコミットされ、既存の未コミット環境設定ファイルは含まれない。
