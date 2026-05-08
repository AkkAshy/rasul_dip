import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { ModelQualityTable } from "@/components/ModelQualityTable";
import { CategoryDemand } from "@/components/CategoryDemand";
import { DemandTable } from "@/components/DemandTable";
import type { DemandRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchDemand(bottom: boolean = false, limit = 10): Promise<DemandRow[]> {
  try {
    const url = `${API_URL}/analysis/demand-index/?limit=${limit}${bottom ? "&bottom=1" : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const [topDemand, bottomDemand] = await Promise.all([
    fetchDemand(false, 10),
    fetchDemand(true, 10),
  ]);

  // Глобальные показатели (по top-результату → знаем сколько товаров вообще есть)
  const allDemand = await fetchDemand(false, 1000);
  const total = allDemand.length;
  const avgDemand =
    total > 0
      ? allDemand.reduce((sum, r) => sum + r.demand_score, 0) / total
      : 0;
  const highCount = allDemand.filter((r) => r.demand_score >= 50).length;
  const lowCount = allDemand.filter((r) => r.demand_score < 25).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="size-4" /> Назад
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Индекс спроса на товары</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
            Composite Demand Score = популярность × удовлетворённость × поправка
            на жалобы по аспектам. Основан на сентимент-анализе клиентских отзывов
            с маркетплейса Uzum.
          </p>
        </header>

        {/* Сводные карточки */}
        <div className="grid gap-4 md:grid-cols-4 mb-10">
          <StatCard label="Товаров проанализировано" value={total.toString()} />
          <StatCard
            label="Средний Demand Score"
            value={avgDemand.toFixed(1)}
            valueClass="text-blue-600"
          />
          <StatCard
            label="Высокий спрос (≥50)"
            value={highCount.toString()}
            valueClass="text-green-600"
            icon={<TrendingUp className="size-4" />}
          />
          <StatCard
            label="Низкий спрос (<25)"
            value={lowCount.toString()}
            valueClass="text-red-600"
            icon={<TrendingDown className="size-4" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-10">
          <CategoryDemand />
          <ModelQualityTable />
        </div>

        {/* Топ-10 высокий спрос */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-5 text-green-600" />
            <h2 className="text-xl font-semibold">Топ-10 — высокий спрос</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Товары которые покупают и хвалят. NSS — Net Sentiment Score
            ((позитив−негатив)/всего), Pop. — нормированная популярность.
          </p>
          {topDemand.length > 0 ? (
            <DemandTable rows={topDemand} />
          ) : (
            <p className="text-slate-500 text-sm">Нет данных</p>
          )}
        </section>

        {/* Анти-топ */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="size-5 text-red-600" />
            <h2 className="text-xl font-semibold">Анти-топ — низкий спрос</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Товары с наибольшей долей жалоб. Узкое горлышко — аспект, по которому
            больше всего негатива (рекомендация для улучшения).
          </p>
          {bottomDemand.length > 0 ? (
            <DemandTable rows={bottomDemand} highlightBottleneck />
          ) : (
            <p className="text-slate-500 text-sm">Нет данных</p>
          )}
        </section>

        {/* Объяснение формулы */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-950/30 p-6 text-sm">
          <h3 className="font-semibold mb-2">Как считается Demand Score</h3>
          <code className="block font-mono text-xs bg-white dark:bg-slate-900 p-3 rounded-lg mb-3">
            demand = popularity × satisfaction × aspect_penalty × 100
          </code>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>
              <b>popularity</b> = log10(reviews + 1) / log10(101) — нормировка
              0..1, потолок 100 проанализированных отзывов
            </li>
            <li>
              <b>satisfaction</b> = (1·pos + 0.5·neu + 0·neg) / total — Customer
              Satisfaction Index. Нейтрал засчитывается с весом 0.5: «отзыв
              есть, явных жалоб нет». Это смягчает bias модели на узбекском.
            </li>
            <li>
              <b>aspect_penalty</b> = до −15% если по какому-то аспекту
              (доставка / цена / качество / упаковка) больше половины негативных упоминаний
            </li>
            <li className="text-slate-500">
              Пороги: ≥50 — высокий спрос, 25–50 — средний, &lt;25 — низкий.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  valueClass = "",
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}
