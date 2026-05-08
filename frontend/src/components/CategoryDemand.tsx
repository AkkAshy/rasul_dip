import type { CategoryDemandRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchData(): Promise<CategoryDemandRow[]> {
  try {
    const res = await fetch(`${API_URL}/analysis/demand-by-category/`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function scoreColor(s: number): string {
  if (s >= 50) return "text-green-600 font-semibold";
  if (s >= 25) return "text-amber-500 font-semibold";
  return "text-red-600 font-semibold";
}

export async function CategoryDemand() {
  const rows = await fetchData();
  if (rows.length === 0) return null;

  const max = Math.max(...rows.map((r) => r.avg_demand_score));

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <h2 className="text-xl font-semibold mb-1">Спрос по категориям</h2>
      <p className="text-sm text-slate-500 mb-4">
        Средний Demand Score, агрегированный по категории товара. Полезно
        для бизнес-выводов о направлениях ассортимента.
      </p>
      <div className="space-y-3">
        {rows.slice(0, 12).map((r) => (
          <div key={r.category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{r.category}</span>
              <span className="text-slate-500">
                <span className={scoreColor(r.avg_demand_score)}>
                  {r.avg_demand_score.toFixed(1)}
                </span>
                <span className="ml-3 text-xs">
                  {r.products} тов. · {r.total_reviews} отз.
                </span>
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={
                  r.avg_demand_score >= 50
                    ? "h-full bg-green-500"
                    : r.avg_demand_score >= 25
                    ? "h-full bg-amber-500"
                    : "h-full bg-red-500"
                }
                style={{ width: `${(r.avg_demand_score / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
