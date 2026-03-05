import type { Digest, Highlight, AIHighlightResult } from "../types.ts";

export async function saveDigest(
  db: D1Database,
  digest: {
    date: string;
    title: string;
    link: string;
    pub_date: string;
    raw_content: string;
  }
): Promise<number> {
  const result = await db
    .prepare(
      `INSERT INTO digests (date, title, link, pub_date, raw_content)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(date) DO NOTHING`
    )
    .bind(digest.date, digest.title, digest.link, digest.pub_date, digest.raw_content)
    .run();
  return result.meta.last_row_id;
}

export async function saveHighlights(
  db: D1Database,
  digestId: number,
  highlights: AIHighlightResult[]
): Promise<void> {
  const statements = highlights.map((h) =>
    db
      .prepare(
        `INSERT INTO highlights (digest_id, title, summary, importance, category)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(digestId, h.title, h.summary, h.importance, h.category)
  );

  // Also mark digest as processed
  statements.push(
    db
      .prepare(`UPDATE digests SET processed_at = datetime('now') WHERE id = ?`)
      .bind(digestId)
  );

  await db.batch(statements);
}

export async function getDigestByDate(
  db: D1Database,
  date: string
): Promise<Digest | null> {
  return await db
    .prepare(`SELECT * FROM digests WHERE date = ?`)
    .bind(date)
    .first<Digest>();
}

export async function getHighlightsByDate(
  db: D1Database,
  date: string
): Promise<Highlight[]> {
  const { results } = await db
    .prepare(
      `SELECT h.* FROM highlights h
       JOIN digests d ON h.digest_id = d.id
       WHERE d.date = ?
       ORDER BY
         CASE h.importance WHEN 'high' THEN 0 ELSE 1 END,
         h.id`
    )
    .bind(date)
    .all<Highlight>();
  return results;
}

export async function getAvailableDates(
  db: D1Database
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT date FROM digests
       WHERE processed_at IS NOT NULL
       ORDER BY date DESC
       LIMIT 30`
    )
    .all<{ date: string }>();
  return results.map((r) => r.date);
}

export async function getLatestDate(
  db: D1Database
): Promise<string | null> {
  const row = await db
    .prepare(
      `SELECT date FROM digests
       WHERE processed_at IS NOT NULL
       ORDER BY date DESC LIMIT 1`
    )
    .first<{ date: string }>();
  return row?.date ?? null;
}

export async function getUnprocessedDigests(
  db: D1Database
): Promise<Digest[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM digests WHERE processed_at IS NULL ORDER BY date DESC LIMIT 3`
    )
    .all<Digest>();
  return results;
}
