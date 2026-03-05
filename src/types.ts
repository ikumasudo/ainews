export type Env = {
  OPENROUTER_API_KEY: string;
  DB: D1Database;
  CACHE: KVNamespace;
};

export type Digest = {
  id: number;
  date: string;
  title: string;
  link: string;
  pub_date: string;
  raw_content: string;
  processed_at: string | null;
  created_at: string;
};

export type Highlight = {
  id: number;
  digest_id: number;
  title: string;
  summary: string;
  importance: "high" | "medium";
  category: Category;
  link: string;
  created_at: string;
};

export type Category =
  | "model_release"
  | "funding"
  | "research"
  | "product"
  | "policy"
  | "other";

export type AIHighlightResult = {
  title: string;
  summary: string;
  importance: "high" | "medium";
  category: Category;
  link: string;
};

export type RSSItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
};
