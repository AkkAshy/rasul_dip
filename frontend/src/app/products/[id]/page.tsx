import Link from "next/link";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
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
        <div className="panel p-10 text-center">
          <p className="text-sand-dim mb-4">
            Tovar tabılmadı yamasa maǵlıwmat joq
          </p>
          <Link
            href="/dashboard"
            className="text-clay transition-colors hover:text-clay-bright"
          >
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
    <main className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-sand-dim transition-colors hover:text-clay mb-8"
        >
          <ArrowLeft className="size-4" /> Dashboardqa
        </Link>

        <header className="mb-10 animate-fade-up">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-clay mb-3">
            {summary.product.source} · #{summary.product.id}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-sand leading-tight">
            {summary.product.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sand-dim">
            {summary.product.category && (
              <span>
                Kategoriya:{" "}
                <span className="text-sand">{summary.product.category}</span>
              </span>
            )}
            {summary.product.rating_avg != null && (
              <span className="inline-flex items-center gap-1 text-honey">
                <Star className="size-3.5 fill-current" />
                <span className="font-mono tabular-nums">
                  {summary.product.rating_avg.toFixed(2)}
                </span>
              </span>
            )}
            <span className="font-mono tabular-nums text-sand-faint">
              {summary.reviews_total} pikir
            </span>
            {summary.product.url && (
              <a
                href={summary.product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-clay transition-colors hover:text-clay-bright"
              >
                uzumʼda kóriw <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* Demand Score */}
        <div className="mb-6 animate-fade-up">
          <DemandBadge productId={summary.product.id} />
        </div>

        {/* Distribution + Aspects */}
        <div className="mb-6 grid gap-6 md:grid-cols-2 stagger">
          <section className="panel p-6 animate-fade-up">
            <h2 className="font-display text-lg font-bold text-sand mb-4">
              Tónlik dárejeleri
            </h2>
            {summary.sentiment_distribution.length === 0 ? (
              <p className="text-sand-faint text-sm">Analiz házirgeshe joq</p>
            ) : (
              <SentimentDonut data={summary.sentiment_distribution} />
            )}
          </section>

          <section className="panel p-6 animate-fade-up">
            <h2 className="font-display text-lg font-bold text-sand mb-5">
              Aspektʼler
            </h2>
            {aspectMap.size === 0 ? (
              <p className="text-sand-faint text-sm">Aspektʼler belgilenmegen</p>
            ) : (
              <ul className="space-y-4">
                {Array.from(aspectMap.entries()).map(([name, counts]) => {
                  const totalA = Object.values(counts).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const pos = counts.positive || 0;
                  const pct = totalA ? (pos / totalA) * 100 : 0;
                  return (
                    <li key={name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-sand">{name}</span>
                        <span className="font-mono text-xs tabular-nums text-sand-dim">
                          {pos}/{totalA} pozitiv
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-night">
                        <div
                          className="animate-bar h-full rounded-full bg-gradient-to-r from-clay-deep to-clay-bright"
                          style={{ width: `${pct}%` }}
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
        <div className="mb-6 animate-fade-up">
          <PraiseComplaints
            praise={summary.praise}
            complaints={summary.complaints}
          />
        </div>

        {/* Последние отзывы */}
        <section className="panel p-6 animate-fade-up">
          <h2 className="font-display text-lg font-bold text-sand mb-1">
            Eń jańa pikirler
          </h2>
          <p className="text-sm text-sand-dim mb-5">
            Sentiment-modeli belgileri hám klient juldızları menen pikirler.
          </p>
          <ReviewList reviews={summary.latest_reviews} />
        </section>
      </div>
    </main>
  );
}
