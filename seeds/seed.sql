-- Seed data for local development
-- Usage: bun run db:seed:local

DELETE FROM highlights;
DELETE FROM digests;

-- digests: 5 days (2026-03-01 ~ 2026-03-05)
INSERT INTO digests (id, date, title, link, pub_date, raw_content, processed_at) VALUES
(1, '2026-03-01', 'AI News - 2026-03-01', 'https://example.com/2026-03-01', '2026-03-01T08:00:00Z', 'Raw content for 2026-03-01', '2026-03-01T09:00:00Z'),
(2, '2026-03-02', 'AI News - 2026-03-02', 'https://example.com/2026-03-02', '2026-03-02T08:00:00Z', 'Raw content for 2026-03-02', '2026-03-02T09:00:00Z'),
(3, '2026-03-03', 'AI News - 2026-03-03', 'https://example.com/2026-03-03', '2026-03-03T08:00:00Z', 'Raw content for 2026-03-03', '2026-03-03T09:00:00Z'),
(4, '2026-03-04', 'AI News - 2026-03-04', 'https://example.com/2026-03-04', '2026-03-04T08:00:00Z', 'Raw content for 2026-03-04', '2026-03-04T09:00:00Z'),
(5, '2026-03-05', 'AI News - 2026-03-05', 'https://example.com/2026-03-05', '2026-03-05T08:00:00Z', 'Raw content for 2026-03-05', '2026-03-05T09:00:00Z');

-- highlights for 2026-03-01 (7 items)
INSERT INTO highlights (digest_id, title, summary, importance, category) VALUES
(1, 'OpenAI、GPT-5を正式発表', 'OpenAIが次世代モデルGPT-5を発表。マルチモーダル性能が大幅に向上し、推論能力でベンチマーク記録を更新した。', 'high', 'model_release'),
(1, 'Anthropic、シリーズDで30億ドル調達', 'Anthropicが新たな資金調達ラウンドを完了。評価額は600億ドルに到達し、AIセーフティ研究の加速を目指す。', 'high', 'funding'),
(1, 'Google DeepMind、タンパク質設計AIを論文発表', 'AlphaFold3の技術を拡張した新手法により、任意の機能を持つタンパク質の設計が可能に。Nature誌に掲載。', 'high', 'research'),
(1, 'Notion AIがリアルタイム共同編集に対応', 'Notion AIアシスタントが複数ユーザーの同時編集をサポート。チーム作業の効率が大幅に向上する見込み。', 'medium', 'product'),
(1, 'EU AI法の施行細則が確定', '欧州委員会がAI法の詳細な施行ガイドラインを公表。ハイリスクAIの分類基準と監査要件が明確化された。', 'medium', 'policy'),
(1, 'スタンフォード大学、AI教育カリキュラムを全学必修化', '2026年度からすべての学部でAIリテラシー科目を必修に。他大学にも広がる動きが見られる。', 'medium', 'other'),
(1, 'Mistral、コード特化モデルCodestral v2を公開', 'フランスのMistral AIがコーディング特化の新モデルを公開。HumanEvalベンチマークでトップクラスの性能を達成。', 'medium', 'model_release');

-- highlights for 2026-03-02 (6 items)
INSERT INTO highlights (digest_id, title, summary, importance, category) VALUES
(2, 'Meta、Llama 4を発表', 'Meta AIが次世代オープンソースLLM「Llama 4」を発表。4050億パラメータのMoEアーキテクチャを採用。', 'high', 'model_release'),
(2, 'Sakana AI、シリーズBで5億ドル調達', '東京拠点のSakana AIが大型資金調達を完了。自然界にインスパイアされたAI研究を加速する方針。', 'high', 'funding'),
(2, 'MIT、自己改善AIエージェントの安全性フレームワークを提案', '自律的に学習・改善するAIエージェントの安全性を担保する新たな理論的枠組みを発表。', 'medium', 'research'),
(2, 'GitHub Copilot、プロジェクト全体の理解が可能に', 'GitHub Copilotの新バージョンがリポジトリ全体のコンテキストを理解し、アーキテクチャレベルの提案が可能に。', 'medium', 'product'),
(2, '中国、生成AIの輸出管理規制を強化', '中国政府が大規模言語モデルの輸出に新たな規制を導入。技術移転の審査プロセスが厳格化される。', 'medium', 'policy'),
(2, 'AI生成コンテンツの検出精度が99%に到達', 'デジタルウォーターマーク技術の進歩により、AI生成テキスト・画像の検出精度が飛躍的に向上した。', 'medium', 'other');

-- highlights for 2026-03-03 (8 items)
INSERT INTO highlights (digest_id, title, summary, importance, category) VALUES
(3, 'xAI、Grok 3.5を公開', 'イーロン・マスク率いるxAIがGrok 3.5をリリース。リアルタイムウェブ検索統合と長文コンテキスト処理を強化。', 'high', 'model_release'),
(3, 'Cohere、企業向けRAGプラットフォームで2億ドル調達', 'エンタープライズAI企業Cohereが新たな資金調達を完了。RAG技術の商用展開を拡大する計画。', 'high', 'funding'),
(3, 'DeepMind、数学オリンピック問題をAIが完全解決', 'AlphaProofの後継モデルが国際数学オリンピックの全問題を人間の金メダリスト以上の精度で解決。', 'high', 'research'),
(3, 'Figma AI、デザインからコード生成の精度を大幅改善', 'Figma AIの新機能がデザインファイルから本番品質のReactコードを直接生成。デザイナーとエンジニアの協業を効率化。', 'medium', 'product'),
(3, '日本政府、AI戦略2026を閣議決定', '生成AIの産業活用推進と人材育成に重点を置いた新戦略を発表。年間1000億円規模の投資計画を含む。', 'medium', 'policy'),
(3, 'AIを活用した新素材発見が過去最多ペース', '2026年に入りAI駆動の材料科学研究が急増。新規超伝導体候補の発見数が前年比3倍に達した。', 'medium', 'other'),
(3, 'Apple、オンデバイスLLMの新アーキテクチャを発表', 'Appleがモバイル端末上で効率的に動作する小型言語モデルの新手法を論文で公開。プライバシー保護AIの推進。', 'medium', 'model_release'),
(3, 'Slack、AIワークフロー自動構築機能をリリース', '自然言語で業務フローを記述するだけでSlackワークフローを自動構築。非エンジニアでも複雑な自動化が可能に。', 'medium', 'product');

-- highlights for 2026-03-04 (7 items)
INSERT INTO highlights (digest_id, title, summary, importance, category) VALUES
(4, 'Google、Gemini 2.5 Proを一般公開', 'GoogleがGemini 2.5 Proをすべてのユーザーに公開。200万トークンのコンテキストウィンドウと高度な推論能力を提供。', 'high', 'model_release'),
(4, 'Databricks、MosaicMLチームの新モデルDBRX-2を発表', 'Databricks傘下のMosaicMLが新世代オープンモデルDBRX-2を公開。エンタープライズ用途に最適化。', 'high', 'model_release'),
(4, 'AI創薬スタートアップRecursion、臨床試験で画期的成果', 'AIで設計された新薬候補がフェーズ2臨床試験で従来薬を上回る有効性を示し、株価が急騰。', 'high', 'research'),
(4, 'Perplexity AI、企業向けナレッジ検索を開始', 'Perplexity AIが社内文書を対象としたAI検索サービスを法人向けに提供開始。セキュアな環境での情報検索を実現。', 'medium', 'product'),
(4, '米国議会、AI著作権法案を可決', 'AI学習データに関する著作権者の権利を明確化する法案が上院を通過。AI企業にライセンス取得を義務付ける内容。', 'medium', 'policy'),
(4, 'Stability AI、日本語特化画像生成モデルを公開', 'Stability AIが日本のアニメ・イラストスタイルに特化した画像生成モデルを公開。クリエイター支援を目的とする。', 'medium', 'product'),
(4, 'IEEE、AIエンジニアの倫理ガイドライン改訂版を発行', '技術者向けAI倫理ガイドラインが大幅改訂。自律型AIシステムの設計原則と責任範囲を明確化。', 'medium', 'other');

-- highlights for 2026-03-05 (7 items)
INSERT INTO highlights (digest_id, title, summary, importance, category) VALUES
(5, 'Anthropic、Claude 5を発表', 'AnthropicがClaude 5を正式発表。エージェント能力とコーディング性能が飛躍的に向上し、安全性評価も最高水準を達成。', 'high', 'model_release'),
(5, 'Microsoft、AI特化チップMaia 2の量産開始を発表', 'Microsoftが自社設計のAIアクセラレータMaia 2の量産を開始。Azureデータセンターへの導入でNVIDIA依存を軽減。', 'high', 'funding'),
(5, '東京大学、汎用ロボティクス基盤モデルを公開', '東京大学のチームが多様なロボットに転移可能な基盤モデルを発表。家庭用ロボットの実用化に大きく貢献する可能性。', 'high', 'research'),
(5, 'Vercel、AIフロントエンド自動最適化機能v0 Proを発表', 'Vercelがv0 Proを発表。AIがウェブサイトのパフォーマンスとUXを自動分析・最適化するサービスを提供開始。', 'medium', 'product'),
(5, 'G7、AI国際規制の共同声明を発表', 'G7首脳会議でAIガバナンスに関する共同声明が採択。国境を越えたAI規制の調和に向けた枠組みが合意された。', 'medium', 'policy'),
(5, 'AI翻訳の品質が人間の専門翻訳者と同等に', '最新の評価研究で、AIリアルタイム翻訳が専門分野を含む幅広い領域で人間翻訳者と同等の品質に到達したことが判明。', 'medium', 'other'),
(5, 'Hugging Face、モデルマーケットプレイスの収益分配を開始', 'Hugging Faceがモデル開発者向けの収益分配プログラムを発表。オープンソースAI開発の持続可能性向上を目指す。', 'medium', 'product');
