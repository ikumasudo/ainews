-- Seed data for local development
-- Usage: bun run db:seed:local

DELETE FROM highlights;
DELETE FROM digests;

INSERT INTO digests (id, date, title, link, pub_date, raw_content, processed_at) VALUES
(1, '2026-03-01', 'AI News - 2026-03-01', 'https://example.com/2026-03-01', '2026-03-01T08:00:00Z', 'Raw content', '2026-03-01T09:00:00Z'),
(2, '2026-03-02', 'AI News - 2026-03-02', 'https://example.com/2026-03-02', '2026-03-02T08:00:00Z', 'Raw content', '2026-03-02T09:00:00Z');

INSERT INTO highlights (digest_id, title, summary, importance, category, link) VALUES
(1, 'New model', 'モデル公開の要約。', 'high', 'model_release', 'https://example.com/model'),
(1, 'Funding', '資金調達の要約。', 'high', 'funding', 'https://example.com/funding'),
(1, 'Research', '研究成果の要約。', 'medium', 'research', 'https://example.com/research'),
(1, 'Product', '製品発表の要約。', 'medium', 'product', 'https://example.com/product'),
(1, 'Policy', '政策動向の要約。', 'medium', 'policy', ''),
(1, 'Other', 'その他ニュースの要約。', 'medium', 'other', ''),
(2, 'Next day', '翌日のニュース要約。', 'high', 'model_release', 'https://example.com/next-day');
