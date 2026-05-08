import type { ModelQualityRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchQuality(): Promise<ModelQualityRow[]> {
  try {
    const res = await fetch(`${API_URL}/analysis/model-quality/`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function ModelQualityTable() {
  const rows = await fetchQuality();
  if (rows.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <h2 className="text-xl font-semibold mb-1">Качество модели по языкам</h2>
      <p className="text-sm text-slate-500 mb-4">
        Согласованность метки модели и rating-звёзды (4-5★ → positive, 3★ → neutral, 1-2★ → negative).
        На узбекском метрика резко проседает — обоснование fine-tune'а.
      </p>
      <table className="w-full text-sm">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="text-left py-2">Язык</th>
            <th className="text-right py-2">Отзывов</th>
            <th className="text-right py-2">Согласованность</th>
            <th className="text-right py-2">+ pos</th>
            <th className="text-right py-2">≈ neu</th>
            <th className="text-right py-2">− neg</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.language}
              className="border-b border-slate-100 dark:border-slate-800/60"
            >
              <td className="py-2.5">{r.language_label}</td>
              <td className="py-2.5 text-right tabular-nums">{r.total}</td>
              <td className="py-2.5 text-right tabular-nums">
                <span
                  className={
                    r.agreement_pct >= 60
                      ? "text-green-600 font-medium"
                      : r.agreement_pct >= 30
                      ? "text-amber-500 font-medium"
                      : "text-red-600 font-semibold"
                  }
                >
                  {r.agreement_pct}%
                </span>
              </td>
              <td className="py-2.5 text-right tabular-nums text-green-600">{r.positive}</td>
              <td className="py-2.5 text-right tabular-nums text-slate-500">{r.neutral}</td>
              <td className="py-2.5 text-right tabular-nums text-red-600">{r.negative}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
