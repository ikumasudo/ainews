# 開発環境セットアップ実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** miseで固定したBunを使い、このリポジトリをローカルで再現可能にビルド・実行できる状態へ設定する。

**Architecture:** リポジトリ直下の`mise.toml`をツールバージョンの唯一の定義とし、Bun経由でプロジェクトローカルのWranglerを実行する。秘密情報は追跡対象外の`.dev.vars`へ分離し、D1・KVはWranglerのローカルエミュレーションを使用する。

**Tech Stack:** mise 2026.7.0、Bun 1.3.14、Wrangler 4.69.0、TypeScript 5.9.3、Cloudflare Workers、D1、KV

## 全体制約

- ツール管理にはプロジェクトローカルのmise設定とBunを使用する。
- アプリケーションの挙動および本番Cloudflareリソースを変更しない。
- 秘密情報を出力またはコミットしない。
- 外部サービスへ対話的にログインまたはデプロイしない。
- 作業範囲外のワークツリー変更を保持する。

---

### Task 1: miseと秘密情報テンプレートの設定

**Files:**
- Create: `mise.toml`
- Create: `.dev.vars.example`
- Create locally, ignored: `.dev.vars`

**Interfaces:**
- Consumes: mise 2026.7.0とリポジトリの`.gitignore`
- Produces: Bun 1.3.14、およびWranglerが読み込む`OPENROUTER_API_KEY`

- [ ] **Step 1: プロジェクト用mise設定を作成する**

```toml
[tools]
bun = "1.3.14"
```

- [ ] **Step 2: 秘密情報のサンプルを作成する**

```dotenv
# OpenRouter API key used by the scheduled AI highlight extraction pipeline.
OPENROUTER_API_KEY=replace-with-your-openrouter-api-key
```

- [ ] **Step 3: Git管理対象外のローカル秘密情報ファイルを作成する**

`.dev.vars`を次の内容で作成する。実際のキーはユーザーが後から設定する。

```dotenv
OPENROUTER_API_KEY=
```

- [ ] **Step 4: miseでBunをインストールして確認する**

Run: `mise install && mise exec -- bun --version`

Expected: `1.3.14`

- [ ] **Step 5: 追跡対象を確認する**

Run: `git status --short && git check-ignore .dev.vars`

Expected: `mise.toml`と`.dev.vars.example`だけが新しい追跡候補として表示され、`.dev.vars`は`.gitignore`によって無視される。

### Task 2: 依存関係とローカルD1の初期化

**Files:**
- Consume: `bun.lock`
- Create locally, ignored: `node_modules/`
- Create locally, ignored: `.wrangler/`

**Interfaces:**
- Consumes: Task 1が提供するBun 1.3.14
- Produces: Wrangler 4.69.0を含む依存関係、およびマイグレーション・シード適用済みのローカルD1

- [ ] **Step 1: ロックファイルを固定して依存関係を導入する**

Run: `mise exec -- bun install --frozen-lockfile`

Expected: 終了コード0で完了し、`bun.lock`に差分が生じない。

- [ ] **Step 2: Wranglerのバージョンを確認する**

Run: `mise exec -- bunx wrangler --version`

Expected: `4.69.0`

- [ ] **Step 3: ローカルD1へマイグレーションを適用する**

Run: `mise exec -- bun run db:migrate:local`

Expected: `0001_create_tables.sql`と`0002_add_highlight_link.sql`が適用される。

- [ ] **Step 4: ローカルD1へシードデータを投入する**

Run: `mise exec -- bun run db:seed:local`

Expected: SQL実行が終了コード0で完了する。

- [ ] **Step 5: ロックファイルが不変であることを確認する**

Run: `git diff --exit-code -- bun.lock`

Expected: 出力なし、終了コード0。

### Task 3: 型・ビルド・ローカルHTTP起動の検証

**Files:**
- Regenerate: `worker-configuration.d.ts`
- Create locally, ignored: `dist/`
- Create: `README.md`（再現手順が既存文書に存在しないため）

**Interfaces:**
- Consumes: Task 2が提供する依存関係とローカルD1
- Produces: 設定と一致するWorkers型、dry-runビルド成果物、再現可能な開発手順

- [ ] **Step 1: Workers型を再生成する**

Run: `mise exec -- bun run types`

Expected: `worker-configuration.d.ts`が正常に生成される。

- [ ] **Step 2: TypeScript型チェックを行う**

Run: `mise exec -- bunx tsc --noEmit`

Expected: 出力なし、終了コード0。

- [ ] **Step 3: dry-runビルドを行う**

Run: `mise exec -- bun run build`

Expected: Wranglerがデプロイせず`dist/`へWorkerバンドルを生成する。

- [ ] **Step 4: 開発手順をREADMEへ記載する**

READMEには、`mise install`、`.dev.vars`への実キー設定、`bun install --frozen-lockfile`、ローカルD1初期化、`bun run dev`、検証コマンド、および本番操作にはCloudflare認証が別途必要であることを記載する。

- [ ] **Step 5: ローカルWorkerを起動してHTTP応答を確認する**

Run: `mise exec -- bun run dev -- --port 8787`をバックグラウンド起動し、`curl --fail --silent --show-error http://127.0.0.1:8787/`を実行後、サーバーを終了する。

Expected: HTTP 200のHTML応答を受信し、Wranglerプロセスが正常に終了する。

- [ ] **Step 6: 最終差分と秘密情報の除外を確認する**

Run: `git diff --check && git status --short && git check-ignore .dev.vars node_modules .wrangler dist`

Expected: 空白エラーがなく、`.dev.vars`、`node_modules/`、`.wrangler/`、`dist/`がGit管理対象外である。

Gitコミットでは、意図したファイルだけを明示的にステージし、秘密情報とローカル生成物を含めない。
