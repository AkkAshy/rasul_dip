import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

interface PaginatedProducts {
  count: number;
  results: Product[];
}

async function fetchProducts(params: URLSearchParams): Promise<PaginatedProducts | null> {
  try {
    const url = `${API_URL}/products/?${params.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchCategories(): Promise<{ id: number; name: string }[]> {
  try {
    const res = await fetch(`${API_URL}/products/categories/`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || data;
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; ordering?: string }>;
}) {
  const sp = await searchParams;

  // Соберём query params для DRF
  const apiParams = new URLSearchParams();
  apiParams.set("page_size", "50");
  if (sp.search) apiParams.set("search", sp.search);
  if (sp.category) apiParams.set("category", sp.category);
  apiParams.set("ordering", sp.ordering || "-reviews_count");

  const [data, categories] = await Promise.all([
    fetchProducts(apiParams),
    fetchCategories(),
  ]);

  const products = data?.results || [];
  const total = data?.count || 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="size-4" /> Назад
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Продукты</h1>
          <p className="text-slate-500 text-sm">
            Всего: {total}. Кликни товар чтобы увидеть Demand Score и аспекты.
          </p>
        </header>

        {/* Filters */}
        <form className="mb-8 grid gap-3 md:grid-cols-3" method="get">
          <input
            type="text"
            name="search"
            defaultValue={sp.search || ""}
            placeholder="Поиск по названию"
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
          <select
            name="category"
            defaultValue={sp.category || ""}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="ordering"
            defaultValue={sp.ordering || "-reviews_count"}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="-reviews_count">По числу отзывов ↓</option>
            <option value="-rating_avg">По рейтингу ↓</option>
            <option value="rating_avg">По рейтингу ↑</option>
            <option value="-created_at">Свежие первыми</option>
            <option value="name">По имени A→Z</option>
          </select>
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
            >
              Применить
            </button>
            <Link
              href="/products"
              className="rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Сброс
            </Link>
          </div>
        </form>

        {products.length === 0 ? (
          <p className="text-slate-500">Ничего не найдено.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between gap-3">
                  <h3 className="font-semibold line-clamp-2">{p.name}</h3>
                  <span className="text-xs text-slate-500 shrink-0">{p.source}</span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  {p.category_name && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      {p.category_name}
                    </span>
                  )}
                  {p.rating_avg != null && <span>★ {p.rating_avg.toFixed(2)}</span>}
                  <span>{p.reviews_count} отзывов</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
