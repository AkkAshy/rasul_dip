import axios from "axios";

// Единый дефолт по всему фронту — совпадает с README и server-компонентами.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export interface Product {
  id: number;
  name: string;
  source: string;
  category_name: string | null;
  price: number | null;
  rating_avg: number | null;
  reviews_count: number;
}

export interface DemandRow {
  product_id: number;
  name: string;
  source: string;
  category: string | null;
  rating_avg: number | null;
  reviews_count: number;
  reviews_analyzed: number;
  positive: number;
  neutral: number;
  negative: number;
  nss: number;
  popularity: number;
  aspect_penalty: number;
  demand_score: number;
  bottleneck_aspect: string | null;
}

export interface AspectQuote {
  aspect: string;
  score: number;
  snippet: string;
}

export interface ReviewItem {
  id: number;
  rating: number | null;
  language: string;
  author: string;
  text: string;
  posted_at: string | null;
  sentiment_label: "positive" | "neutral" | "negative" | null;
  sentiment_score: number | null;
}

export interface ProductSummary {
  product: {
    id: number;
    name: string;
    source: string;
    category: string | null;
    rating_avg: number | null;
    url: string;
  };
  reviews_total: number;
  sentiment_distribution: { label: string; count: number }[];
  aspects: { aspect__name: string; label: string; count: number }[];
  praise: AspectQuote[];
  complaints: AspectQuote[];
  latest_reviews: ReviewItem[];
}

export interface CategoryDemandRow {
  category: string;
  products: number;
  total_reviews: number;
  avg_demand_score: number;
  avg_nss: number;
}

export interface ModelQualityRow {
  language: string;
  language_label: string;
  total: number;
  agreement_pct: number;
  positive: number;
  neutral: number;
  negative: number;
}

export const apiClient = {
  listProducts: () => api.get<{ results: Product[] }>("/products/").then((r) => r.data.results),
  demandIndex: () => api.get<DemandRow[]>("/analysis/demand-index/").then((r) => r.data),
  productSummary: (id: number) =>
    api.get<ProductSummary>(`/analysis/products/${id}/summary/`).then((r) => r.data),
};
