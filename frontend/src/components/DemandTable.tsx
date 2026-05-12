import Link from "next/link";
import type { DemandRow } from "@/lib/api";

function scoreColor(s: number): string {
  if (s >= 50) return "text-green-600 font-semibold";
  if (s >= 25) return "text-amber-500 font-semibold";
  return "text-red-600 font-semibold";
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
          <tr>
            <th className="text-left p-3">Tovar</th>
            <th className="text-right p-3">Demand</th>
            <th className="text-right p-3">NSS</th>
            <th className="text-right p-3">Pop.</th>
            <th className="text-right p-3">Pikir</th>
            {highlightBottleneck && (
              <th className="text-left p-3">Tar boyın</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.product_id}
              className="border-t border-slate-100 dark:border-slate-800/60"
            >
              <td className="p-3 max-w-md">
                <Link
                  href={`/products/${r.product_id}`}
                  className="text-blue-600 hover:underline line-clamp-2"
                >
                  {r.name}
                </Link>
              </td>
              <td className="p-3 text-right tabular-nums">
                <span className={scoreColor(r.demand_score)}>
                  {r.demand_score.toFixed(1)}
                </span>
                <div className="text-[10px] uppercase text-slate-400 leading-none">
                  {scoreVerdict(r.demand_score)}
                </div>
              </td>
              <td className="p-3 text-right tabular-nums">
                <span
                  className={
                    r.nss > 0.3
                      ? "text-green-600"
                      : r.nss < -0.1
                      ? "text-red-600"
                      : "text-slate-500"
                  }
                >
                  {r.nss > 0 ? "+" : ""}
                  {r.nss.toFixed(2)}
                </span>
              </td>
              <td className="p-3 text-right tabular-nums text-slate-500">
                {r.popularity.toFixed(2)}
              </td>
              <td className="p-3 text-right tabular-nums">{r.reviews_analyzed}</td>
              {highlightBottleneck && (
                <td className="p-3">
                  {r.bottleneck_aspect ? (
                    <span className="inline-flex items-center rounded-md bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2 py-0.5 text-xs">
                      {r.bottleneck_aspect}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
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
