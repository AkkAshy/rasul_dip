import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SentimentDonut } from "@/components/SentimentDonut";
import { DemandBadge } from "@/components/DemandBadge";
import { PraiseComplaints } from "@/components/PraiseComplaints";
import { ReviewList } from "@/components/ReviewList";
import type { ProductSummary } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchSummary(id: string): Promise<ProductSummary | null> {
  try {
    const res = await fetch(`${API_URL}/analysis/products/${id}/summary/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const summary = await fetchSummary(id);

  if (!summary) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Tovar tabılmadı yamasa maǵlıwmat joq</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Dashboardqa
          </Link>
        </div>
      </main>
    );
  }

  // Группируем аспекты {name → {positive, neutral, negative}}
  const aspectMap = new Map<string, Record<string, number>>();
  for (const a of summary.aspects) {
    const key = a.aspect__name;
    if (!aspectMap.has(key)) aspectMap.set(key, {});
    aspectMap.get(key)![a.label] = a.count;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="size-4" /> Dashboardqa
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold">{summary.product.name}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 flex-wrap">
            <span>Dárek: {summary.product.source}</span>
            {summary.product.category && (
              <span>Kategoriya: {summary.product.category}</span>
            )}
            {summary.product.rating_avg != null && (
              <span>★ {summary.product.rating_avg.toFixed(2)}</span>
            )}
            <span>{summary.reviews_total} pikir</span>
            {summary.product.url && (
              <a
                href={summary.product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                uzum'da kóriw <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* Demand Score */}
        <div className="mb-6">
          <DemandBadge productId={summary.product.id} />
        </div>

        {/* Distribution + Aspects */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold mb-4">Tónlik dárejeleri</h2>
            {summary.sentiment_distribution.length === 0 ? (
              <p className="text-slate-500 text-sm">Analiz házirgeshe joq</p>
            ) : (
              <SentimentDonut data={summary.sentiment_distribution} />
            )}
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold mb-4">Aspekt'ler</h2>
            {aspectMap.size === 0 ? (
              <p className="text-slate-500 text-sm">Aspekt'ler belgilenmegen</p>
            ) : (
              <ul className="space-y-3">
                {Array.from(aspectMap.entries()).map(([name, counts]) => {
                  const total = Object.values(counts).reduce((a, b) => a + b, 0);
                  const pos = counts.positive || 0;
                  return (
                    <li key={name}>
                      <div className="flex justify-between text-sm">
                        <span>{name}</span>
                        <span className="text-slate-500">
                          {pos}/{total} pozitiv
                        </span>
                      </div>
                      <div className="mt-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(pos / total) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Praise / Complaints */}
        <div className="mb-6">
          <PraiseComplaints
            praise={summary.praise}
            complaints={summary.complaints}
          />
        </div>

        {/* Last reviews */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-2">Eń jańa pikirler</h2>
          <p className="text-sm text-slate-500 mb-4">
            Sentiment-modeli belgileri hám klient juldızları menen pikirler.
          </p>
          <ReviewList reviews={summary.latest_reviews} />
        </section>
      </div>
    </main>
  );
}
