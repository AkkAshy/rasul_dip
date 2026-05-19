import Link from "next/link";
import type { DemandRow } from "@/lib/api";

function scoreColor(s: number): string {
  if (s >= 50) return "text-sage";
  if (s >= 25) return "text-honey";
  return "text-rust";
}

function scoreVerdict(s: number): string {
  if (s >= 50) return "joqarı";
  if (s >= 25) return "orta";
  return "tómen";
}

export function DemandTable({
  rows,
  highlightBottleneck = false,
}: {
  rows: DemandRow[];
  highlightBottleneck?: boolean;
}) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left">
            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Tovar
            </th>
            <th className="p-4 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Demand
            </th>
            <th className="p-4 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              NSS
            </th>
            <th className="p-4 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Pop.
            </th>
            <th className="p-4 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Pikir
            </th>
            {highlightBottleneck && (
              <th className="p-4 text-left font-mono text-[11px] uppercase tracking-wider text-sand-faint">
                Tar boyın
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.product_id}
              className="border-t border-hairline-soft transition-colors hover:bg-raised/50"
            >
              <td className="p-4 max-w-md">
                <Link
                  href={`/products/${r.product_id}`}
                  className="text-sand line-clamp-2 transition-colors hover:text-clay-bright"
                >
                  {r.name}
                </Link>
              </td>
              <td className="p-4 text-right">
                <span
                  className={`font-mono text-base font-bold tabular-nums ${scoreColor(
                    r.demand_score
                  )}`}
                >
                  {r.demand_score.toFixed(1)}
                </span>
                <div className="font-mono text-[10px] uppercase leading-none text-sand-faint">
                  {scoreVerdict(r.demand_score)}
                </div>
              </td>
              <td className="p-4 text-right">
                <span
                  className={`font-mono tabular-nums ${
                    r.nss > 0.3
                      ? "text-sage"
                      : r.nss < -0.1
                      ? "text-rust"
                      : "text-sand-dim"
                  }`}
                >
                  {r.nss > 0 ? "+" : ""}
                  {r.nss.toFixed(2)}
                </span>
              </td>
              <td className="p-4 text-right font-mono tabular-nums text-sand-dim">
                {r.popularity.toFixed(2)}
              </td>
              <td className="p-4 text-right font-mono tabular-nums text-sand">
                {r.reviews_analyzed}
              </td>
              {highlightBottleneck && (
                <td className="p-4">
                  {r.bottleneck_aspect ? (
                    <span className="inline-flex items-center rounded-md border border-rust/30 bg-rust/10 px-2 py-0.5 text-xs text-rust-bright">
                      {r.bottleneck_aspect}
                    </span>
                  ) : (
                    <span className="text-sand-faint text-xs">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
