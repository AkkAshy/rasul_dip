import Link from "next/link";
import { ArrowLeft, Search, Star } from "lucide-react";
import type { Product } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

interface PaginatedProducts {
  count: number;
  results: Product[];
}

async function fetchProducts(
  params: URLSearchParams
): Promise<PaginatedProducts | null> {
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
    const res = await fetch(`${API_URL}/products/categories/`, {
      cache: "no-store",
    });
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
  searchParams: Promise<{
    search?: string;
    category?: string;
    ordering?: string;
  }>;
}) {
  const sp = await searchParams;

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

  const fieldCls =
    "w-full rounded-lg border border-hairline bg-night px-3.5 py-2.5 text-sm text-sand placeholder:text-sand-faint outline-none transition-colors focus:border-clay";

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sand-dim transition-colors hover:text-clay mb-8"
        >
          <ArrowLeft className="size-4" /> Artqa
        </Link>

        <header className="mb-8 animate-fade-up">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-clay mb-3">
            Catalog
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-sand">
            Tovarlar
          </h1>
          <p className="mt-3 text-sm text-sand-dim">
            Tabıldı{" "}
            <span className="font-mono text-clay tabular-nums">{total}</span>.
            Demand Score hám aspektʼlerdi kóriw ushın tovarǵa basıń.
          </p>
        </header>

        {/* Фильтры */}
        <form
          className="panel mb-10 grid gap-3 p-5 md:grid-cols-3 animate-fade-up"
          method="get"
        >
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sand-faint" />
            <input
              type="text"
              name="search"
              defaultValue={sp.search || ""}
              placeholder="Tovar atı boyınsha izlew"
              className={`${fieldCls} pl-9`}
            />
          </div>
          <select
            name="category"
            defaultValue={sp.category || ""}
            className={fieldCls}
          >
            <option value="">Barlıq kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="ordering"
            defaultValue={sp.ordering || "-reviews_count"}
            className={fieldCls}
          >
            <option value="-reviews_count">Pikir sanı boyınsha ↓</option>
            <option value="-rating_avg">Reyting boyınsha ↓</option>
            <option value="rating_avg">Reyting boyınsha ↑</option>
            <option value="-created_at">Jańalar birinshi</option>
            <option value="name">At boyınsha A→Z</option>
          </select>
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-clay px-5 py-2.5 text-sm font-semibold text-night transition-all hover:bg-clay-bright"
            >
              Qollaw
            </button>
            <Link
              href="/products"
              className="rounded-lg border border-hairline px-5 py-2.5 text-sm text-sand-dim transition-colors hover:border-clay-deep hover:text-sand"
            >
              Taslaw
            </Link>
          </div>
        </form>

        {products.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-sand-faint">
            Tabılmadı.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 stagger">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="panel panel-hover group animate-fade-up p-5"
              >
                <div className="flex justify-between gap-3">
                  <h3 className="font-medium text-sand line-clamp-2 transition-colors group-hover:text-clay-bright">
                    {p.name}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-sand-faint">
                    {p.source}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  {p.category_name && (
                    <span className="rounded-md border border-hairline bg-raised px-2 py-0.5 text-xs text-sand-dim">
                      {p.category_name}
                    </span>
                  )}
                  {p.rating_avg != null && (
                    <span className="inline-flex items-center gap-1 text-honey">
                      <Star className="size-3.5 fill-current" />
                      <span className="font-mono tabular-nums">
                        {p.rating_avg.toFixed(2)}
                      </span>
                    </span>
                  )}
                  <span className="font-mono text-xs tabular-nums text-sand-faint">
                    {p.reviews_count} pikir
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
