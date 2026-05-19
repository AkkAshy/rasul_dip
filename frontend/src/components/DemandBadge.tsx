import type { DemandRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchDemand(productId: number): Promise<DemandRow | null> {
  try {
    const res = await fetch(
      `${API_URL}/analysis/products/${productId}/demand/`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function classify(score: number): { label: string; cls: string } {
  if (score >= 50)
    return {
      label: "Joqarı talab",
      cls: "border-sage/30 bg-sage/10 text-sage-bright",
    };
  if (score >= 25)
    return {
      label: "Orta talab",
      cls: "border-honey/30 bg-honey/10 text-honey",
    };
  return {
    label: "Tómen talab",
    cls: "border-rust/30 bg-rust/10 text-rust-bright",
  };
}

export async function DemandBadge({ productId }: { productId: number }) {
  const d = await fetchDemand(productId);
  if (!d) return null;
  const { label, cls } = classify(d.demand_score);

  return (
    <section className="panel relative overflow-hidden p-7">
      {/* свечение фона под hero-числом */}
      <div className="pointer-events-none absolute -left-10 -top-16 size-64 rounded-full bg-clay/10 blur-3xl" />

      <div className="relative flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${cls}`}
          >
            {label}
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-6xl font-extrabold tabular-nums text-clay glow-clay">
              {d.demand_score.toFixed(1)}
            </span>
            <span className="font-mono text-sm text-sand-faint">/ 100</span>
          </div>
        </div>

        <div className="ml-auto grid grid-cols-3 gap-6 text-sm">
          <Stat
            label="Net Sentiment"
            value={`${d.nss > 0 ? "+" : ""}${d.nss.toFixed(2)}`}
          />
          <Stat label="Populyarlıq" value={d.popularity.toFixed(2)} />
          <Stat
            label="Aspekt poprawkası"
            value={`×${d.aspect_penalty.toFixed(2)}`}
          />
        </div>
      </div>

      {d.bottleneck_aspect && (
        <div className="relative mt-6 flex items-center gap-2 border-t border-hairline-soft pt-4 text-sm">
          <span className="text-sand-faint">Tar boyın:</span>
          <span className="inline-flex items-center rounded-md border border-rust/30 bg-rust/10 px-2 py-0.5 text-xs text-rust-bright">
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
      <div className="text-xs text-sand-faint mb-1">{label}</div>
      <div className="font-mono text-lg font-semibold tabular-nums text-sand">
        {value}
      </div>
    </div>
  );
}
