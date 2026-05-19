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
  if (s >= 50) return "text-sage";
  if (s >= 25) return "text-honey";
  return "text-rust";
}

function barColor(s: number): string {
  if (s >= 50) return "from-sage/60 to-sage-bright";
  if (s >= 25) return "from-clay-deep to-clay-bright";
  return "from-rust/60 to-rust-bright";
}

export async function CategoryDemand() {
  const rows = await fetchData();
  if (rows.length === 0) return null;

  const max = Math.max(...rows.map((r) => r.avg_demand_score));

  return (
    <section className="panel p-6 animate-fade-up">
      <h2 className="font-display text-lg font-bold text-sand mb-1.5">
        Kategoriya boyınsha talab
      </h2>
      <p className="text-sm text-sand-dim mb-5 leading-relaxed">
        Tovar kategoriyaları boyınsha orta Demand Score. Biznes-strategiya
        qabıllawda paydalı.
      </p>
      <div className="space-y-4">
        {rows.slice(0, 12).map((r) => (
          <div key={r.category}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-sand">{r.category}</span>
              <span className="flex items-baseline gap-3">
                <span
                  className={`font-mono font-semibold tabular-nums ${scoreColor(
                    r.avg_demand_score
                  )}`}
                >
                  {r.avg_demand_score.toFixed(1)}
                </span>
                <span className="font-mono text-xs text-sand-faint">
                  {r.products} tov · {r.total_reviews} pikir
                </span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-night">
              <div
                className={`animate-bar h-full rounded-full bg-gradient-to-r ${barColor(
                  r.avg_demand_score
                )}`}
                style={{ width: `${(r.avg_demand_score / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
