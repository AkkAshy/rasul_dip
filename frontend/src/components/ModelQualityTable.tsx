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

function qualityColor(pct: number): string {
  if (pct >= 60) return "text-sage";
  if (pct >= 30) return "text-honey";
  return "text-rust";
}

export async function ModelQualityTable() {
  const rows = await fetchQuality();
  if (rows.length === 0) return null;

  return (
    <section className="panel p-6 animate-fade-up">
      <h2 className="font-display text-lg font-bold text-sand mb-1.5">
        Modeldıń sapası til boyınsha
      </h2>
      <p className="text-sm text-sand-dim mb-5 leading-relaxed">
        Modeldıń belgisi hám klient juldız reytingı arasındaǵı uyǵınlıq (4-5★ →
        positive, 3★ → neutral, 1-2★ → negative). Ózbek tilinde ózi-anıqlawı
        keskin tómen — fine-tune zarurlıǵı.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left">
            <th className="py-2.5 font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Til
            </th>
            <th className="py-2.5 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Pikir
            </th>
            <th className="py-2.5 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              Sapa
            </th>
            <th className="py-2.5 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              + pos
            </th>
            <th className="py-2.5 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              ≈ neu
            </th>
            <th className="py-2.5 text-right font-mono text-[11px] uppercase tracking-wider text-sand-faint">
              − neg
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.language} className="border-t border-hairline-soft">
              <td className="py-3 text-sand">{r.language_label}</td>
              <td className="py-3 text-right font-mono tabular-nums text-sand-dim">
                {r.total}
              </td>
              <td className="py-3 text-right">
                <span
                  className={`font-mono font-semibold tabular-nums ${qualityColor(
                    r.agreement_pct
                  )}`}
                >
                  {r.agreement_pct}%
                </span>
              </td>
              <td className="py-3 text-right font-mono tabular-nums text-sage">
                {r.positive}
              </td>
              <td className="py-3 text-right font-mono tabular-nums text-sand-dim">
                {r.neutral}
              </td>
              <td className="py-3 text-right font-mono tabular-nums text-rust">
                {r.negative}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
