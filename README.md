# ainews

Cloudflare Workers、Hono、D1、KVで動作するAIニュースダイジェストです。定期処理がRSSを取得し、OpenRouterを使って重要ニュースを抽出します。

## 必要なもの

- [mise](https://mise.jdx.dev/)
- OpenRouter APIキー（AI抽出処理を実行する場合）
- CloudflareアカウントとWrangler認証（リモートリソースの操作やデプロイを行う場合）

Bun、Wrangler、TypeScriptはリポジトリ内でバージョンを固定しているため、グローバルインストールは不要です。

## ローカルセットアップ

```bash
mise install
mise exec -- bun install --frozen-lockfile
cp .dev.vars.example .dev.vars
```

`.dev.vars`を編集し、実際のOpenRouter APIキーを設定します。

```dotenv
OPENROUTER_API_KEY=your-api-key
```

ローカルD1を初期化します。

```bash
mise exec -- bun run db:migrate:local
mise exec -- bun run db:seed:local
```

開発サーバーを起動します。

```bash
mise exec -- bun run dev
```

既定のURLは `http://localhost:8787` です。`.dev.vars`のAPIキーが空でも通常のページ表示は確認できますが、CronによるAI抽出処理には有効なキーが必要です。

## 検証

```bash
mise exec -- bun run check
```

`check`はテスト、TypeScript型チェック、Wranglerのdry-runビルドを順に実行します。dry-runはCloudflareへデプロイしません。

GitHub ActionsもPull Requestと`main`へのpushで同じ検証を実行します。デプロイ処理は含まず、既存のCloudflare Git連携による自動デプロイとは独立しています。

## 本番操作

本番操作の前にWranglerをCloudflareへ認証し、OpenRouter APIキーをWorker secretとして登録します。

```bash
mise exec -- bunx wrangler login
mise exec -- bunx wrangler secret put OPENROUTER_API_KEY
mise exec -- bun run deploy
```

`deploy`はリモートD1へマイグレーションを適用してからWorkerをデプロイします。対象アカウントとリソースを確認してから実行してください。
