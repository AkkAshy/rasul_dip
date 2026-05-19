import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { ModelQualityTable } from "@/components/ModelQualityTable";
import { CategoryDemand } from "@/components/CategoryDemand";
import { DemandTable } from "@/components/DemandTable";
import { ScraperPanel } from "@/components/ScraperPanel";
import type { DemandRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

// Один запрос на всю таблицу — backend пересчитывает Demand Score 1 раз,
// а top / bottom / агрегаты выводятся срезами здесь. Раньше было 3×.
async function fetchAllDemand(): Promise<DemandRow[]> {
  try {
    const res = await fetch(`${API_URL}/analysis/demand-index/?limit=1000`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  // Backend отдаёт уже отсортированным по demand_score ↓.
  const allDemand = await fetchAllDemand();
  const total = allDemand.length;

  const topDemand = allDemand.slice(0, 10);
  const bottomDemand = allDemand.slice(-10).reverse(); // от худшего

  const avgDemand =
    total > 0
      ? allDemand.reduce((sum, r) => sum + r.demand_score, 0) / total
      : 0;
  const highCount = allDemand.filter((r) => r.demand_score >= 50).length;
  const lowCount = allDemand.filter((r) => r.demand_score < 25).length;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sand-dim transition-colors hover:text-clay mb-8"
        >
          <ArrowLeft className="size-4" /> Artqa
        </Link>

        <header className="mb-10 animate-fade-up">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-clay mb-3">
            Analytics
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-sand">
            Tovarlar talab indeksi
          </h1>
          <p className="mt-4 max-w-3xl text-sand-dim leading-relaxed">
            Kompozit Demand Score = populyarlıq × qanaatlanıwshılıq × aspekt
            poprawkası. Uzum Market klient pikirlerine sentimental analiz qollap
            esaplanǵan.
          </p>
        </header>

        {/* Scraper panel */}
        <div className="mb-10 animate-fade-up">
          <ScraperPanel />
        </div>

        {/* KPI-полоса */}
        <div className="mb-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-4 stagger">
          <StatCard label="Analiz etilgen tovar" value={total.toString()} />
          <StatCard
            label="Orta Demand Score"
            value={avgDemand.toFixed(1)}
            accent="clay"
          />
          <StatCard
            label="Joqarı talab ≥50"
            value={highCount.toString()}
            accent="sage"
            icon={<TrendingUp className="size-3.5" />}
          />
          <StatCard
            label="Tómen talab <25"
            value={lowCount.toString()}
            accent="rust"
            icon={<TrendingDown className="size-3.5" />}
          />
        </div>

        <div className="mb-12 grid gap-6 lg:grid-cols-2 stagger">
          <CategoryDemand />
          <ModelQualityTable />
        </div>

        {/* Top-10 */}
        <section id="demand" className="mb-12 animate-fade-up scroll-mt-8">
          <SectionHead
            icon={<TrendingUp className="size-4 text-sage" />}
            title="Top-10 — joqarı talab"
            desc="Eń kóp satılatuǵın hám maqtanatuǵın tovarlar. NSS — Net Sentiment Score, Pop. — normallastırılǵan populyarlıq."
          />
          {topDemand.length > 0 ? (
            <DemandTable rows={topDemand} />
          ) : (
            <EmptyRow />
          )}
        </section>

        {/* Anti-top */}
        <section className="mb-12 animate-fade-up">
          <SectionHead
            icon={<TrendingDown className="size-4 text-rust" />}
            title="Anti-top — tómen talab"
            desc="Klient pikirinde shaǵımı kóp tovarlar. «Tar boyın» — eń kóp negativ tabılǵan aspekt, vendorǵa jaqsırtıw signalı."
          />
          {bottomDemand.length > 0 ? (
            <DemandTable rows={bottomDemand} highlightBottleneck />
          ) : (
            <EmptyRow />
          )}
        </section>

        {/* Формула */}
        <section className="panel p-7 text-sm animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-1.5 rounded-full bg-clay" />
            <h3 className="font-display text-lg font-bold text-sand">
              Demand Score qanday esaplanadı
            </h3>
          </div>
          <code className="block font-mono text-xs text-clay-bright bg-night border border-hairline p-4 rounded-lg mb-5">
            demand = popularity × satisfaction × aspect_penalty × 100
          </code>
          <ul className="space-y-2.5 text-sand-dim">
            <li>
              <b className="text-sand">popularity</b> = log₁₀(reviews + 1) /
              log₁₀(101) — 0..1 normallastırıw, potolok 100 pikir.
            </li>
            <li>
              <b className="text-sand">satisfaction</b> = (1·pos + 0.5·neu +
              0·neg) / total — Customer Satisfaction Index. Neytral 0.5 salmaq
              menen — modeldıń ózbek tilindegi biasʼın jumsartadı.
            </li>
            <li>
              <b className="text-sand">aspect_penalty</b> = 15%ʼǵa shekem
              poprawka, eger aspekt boyınsha kóp negativ tabılsa (jetkeriw /
              baha / sapa / qadoq).
            </li>
            <li className="text-sand-faint">
              Shegaralar: ≥50 — joqarı talab, 25–50 — orta, &lt;25 — tómen.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

const ACCENT: Record<string, string> = {
  clay: "text-clay",
  sage: "text-sage",
  rust: "text-rust",
  sand: "text-sand",
};

function StatCard({
  label,
  value,
  accent = "sand",
  icon,
}: {
  label: string;
  value: string;
  accent?: "clay" | "sage" | "rust" | "sand";
  icon?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up bg-panel p-6">
      <div className="flex items-center gap-1.5 text-xs text-sand-faint mb-2">
        {icon}
        {label}
      </div>
      <div
        className={`font-mono text-3xl font-bold tabular-nums ${ACCENT[accent]}`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHead({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md border border-hairline bg-raised">
          {icon}
        </span>
        <h2 className="font-display text-xl font-bold text-sand">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-sand-dim max-w-3xl">{desc}</p>
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="panel p-8 text-center text-sm text-sand-faint">
      Maǵlıwmat joq — aldın scraper paneli arqalı pikir jıynań.
    </div>
  );
}
