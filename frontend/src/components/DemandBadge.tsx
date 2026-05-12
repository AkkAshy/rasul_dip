import type { DemandRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchDemand(productId: number): Promise<DemandRow | null> {
  try {
    const res = await fetch(`${API_URL}/analysis/products/${productId}/demand/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function classify(score: number): { label: string; cls: string } {
  if (score >= 50) return { label: "Joqarı talab", cls: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300" };
  if (score >= 25) return { label: "Orta talab", cls: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" };
  return { label: "Tómen talab", cls: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300" };
}

export async function DemandBadge({ productId }: { productId: number }) {
  const d = await fetchDemand(productId);
  if (!d) return null;
  const { label, cls } = classify(d.demand_score);
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <div className="flex items-baseline gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
          {label}
        </span>
        <span className="text-4xl font-bold tabular-nums">{d.demand_score.toFixed(1)}</span>
        <span className="text-slate-500">/ 100</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <Stat label="Net Sentiment" value={`${d.nss > 0 ? "+" : ""}${d.nss.toFixed(2)}`} />
        <Stat label="Popularlıq" value={d.popularity.toFixed(2)} />
        <Stat label="Aspekt poprawkası" value={`×${d.aspect_penalty.toFixed(2)}`} />
      </div>
      {d.bottleneck_aspect && (
        <div className="mt-4 text-sm">
          <span className="text-slate-500">Tar boyın: </span>
          <span className="inline-flex items-center rounded-md bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2 py-0.5 text-xs ml-1">
            {d.bottleneck_aspect}
          </span>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
