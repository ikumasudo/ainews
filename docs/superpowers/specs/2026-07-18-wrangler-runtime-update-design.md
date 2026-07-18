# Wrangler・Workersランタイム更新設計

## 目的

プロジェクトのWranglerを4.112.0へ更新し、Cloudflare Workersの`compatibility_date`を2026-07-18へ更新する。更新後も既存アプリケーションがローカルで型検査・ビルド・HTTP実行できることを確認する。

## 変更範囲

- `package.json`のWrangler開発依存を`^4.112.0`へ更新する。
- Bunを使って`bun.lock`をWrangler 4.112.0に合わせて更新する。
- `wrangler.jsonc`の`compatibility_date`を`2026-07-18`へ更新する。
- `nodejs_compat`を含む既存の互換性フラグ、D1・KV・Cron設定は変更しない。
- 更新後の設定から`worker-configuration.d.ts`を再生成する。

本番デプロイ、リモートD1・KVの変更、Worker Secretの変更は行わない。

## 更新方式

Wranglerの既存指定がキャレット形式であるため、`^4.112.0`を使用して同じメジャーバージョン内の更新を許可する。パッケージ操作にはmiseで固定済みのBun 1.3.14を使用する。

互換性日付は現在日である2026-07-18へ一括更新する。これにより現在のWorkersランタイム動作を明示的に採用し、古い互換性日付を残さない。

## 検証

1. インストールされたWranglerが4.112.0であることを確認する。
2. Workers型を再生成する。
3. TypeScriptの型検査を実行する。
4. Wranglerのdry-runビルドを実行し、デプロイせずバンドル可能なことを確認する。
5. ローカルWorkerを起動し、リダイレクト後のHTMLがHTTP 200で返ることを確認する。
6. `.dev.vars`を含む秘密情報がGit差分へ含まれていないことを確認する。

検証に失敗した場合は本番操作へ進まず、Wrangler更新または互換性日付更新による影響を切り分ける。
