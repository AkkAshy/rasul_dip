"use client";
import { useEffect, useState } from "react";
import { Play, RefreshCcw, Check, X, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

interface ScraperJob {
  id: number;
  kind: string;
  kind_label: string;
  status: "pending" | "running" | "success" | "failed";
  params: Record<string, unknown>;
  products_added: number;
  reviews_added: number;
  sentiment_analyzed: number;
  error: string;
  log_tail: string[];
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
}

type JobKind = "scrape_top" | "scrape_full" | "run_sentiment" | "run_absa";

const KIND_PRESETS: Record<JobKind, { label: string; params: Record<string, unknown>; desc: string }> = {
  scrape_top: {
    label: "Tovar metadata + top-pikir (tez)",
    params: { from: 1, to: 1000, min_reviews: 5 },
    desc: "REST API arqalı 1000 tovar ID'in tekseredi, hár birinen 1 top-pikir tortıladı (~8 minut).",
  },
  scrape_full: {
    label: "Tólıq pikirler (Playwright)",
    params: { top: 50, max_reviews: 100, page_size: 30, between: 4, rate_delay: 1 },
    desc: "GraphQL arqalı top-50 tovardıń tólıq pikirleri tortıladı (~25 minut).",
  },
  run_sentiment: {
    label: "Sentiment analiz",
    params: { batch: 32 },
    desc: "Belgilenbegen pikirlerge HuggingFace modeli arqalı tónlik beredi.",
  },
  run_absa: {
    label: "ABSA — aspekt analizı",
    params: { reanalyze: false },
    desc: "Hár pikirde 4 aspekt (yetkazıb berıw, baha, sapa, qadoq) izlenedi.",
  },
};

function statusBadge(status: ScraperJob["status"]) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    pending: { cls: "bg-slate-100 text-slate-600", icon: <Loader2 className="size-3 animate-spin" />, label: "Kútilmoqda" },
    running: { cls: "bg-blue-100 text-blue-700", icon: <Loader2 className="size-3 animate-spin" />, label: "Islaytur" },
    success: { cls: "bg-green-100 text-green-700", icon: <Check className="size-3" />, label: "Tamam" },
    failed: { cls: "bg-red-100 text-red-700", icon: <X className="size-3" />, label: "Qátegi" },
  };
  const { cls, icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
}

export function ScraperPanel() {
  const [selectedKind, setSelectedKind] = useState<JobKind>("scrape_top");
  const [job, setJob] = useState<ScraperJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Initial load — last job state
  useEffect(() => {
    refresh();
  }, []);

  // Polling while running
  useEffect(() => {
    if (job?.status !== "running" && job?.status !== "pending") return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [job?.status]);

  async function refresh() {
    try {
      const res = await fetch(`${API_URL}/scraper/latest/`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setJob(data);
    } catch {
      // silent
    }
  }

  async function startJob() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/scraper/start/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: selectedKind,
          params: KIND_PRESETS[selectedKind].params,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Belgisiz qátegilik");
      } else {
        setJob(data);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setStarting(false);
    }
  }

  const isRunning = job?.status === "running" || job?.status === "pending";

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Maǵlıwmat jıynaw paneli</h2>
          <p className="text-sm text-slate-500">
            Uzum Market'tan jańa pikirlerdı tortıw hám ML pipeline'in baslaw.
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500"
          title="Jangartıw"
        >
          <RefreshCcw className="size-4" />
        </button>
      </div>

      {/* Kind selector */}
      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <select
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value as JobKind)}
          disabled={isRunning}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        >
          {(Object.entries(KIND_PRESETS) as [JobKind, typeof KIND_PRESETS[JobKind]][]).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <button
          onClick={startJob}
          disabled={isRunning || starting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-medium"
        >
          {starting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {isRunning ? "Jumıs ámeliy ámelge asırılıp atır..." : "Skrabber baslaw"}
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {KIND_PRESETS[selectedKind].desc}
      </p>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Job status card */}
      {job && (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Jumıs #{job.id}</span>
              <span className="text-xs text-slate-500">{job.kind_label}</span>
              {statusBadge(job.status)}
            </div>
            {job.duration_seconds != null && (
              <span className="text-xs text-slate-500 tabular-nums">
                {job.duration_seconds.toFixed(1)}s
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs mb-2">
            <Stat label="Jańa tovar" value={job.products_added} />
            <Stat label="Jańa pikir" value={job.reviews_added} />
            <Stat label="Analiz" value={job.sentiment_analyzed} />
          </div>

          {job.error && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-mono">
              {job.error}
            </div>
          )}

          {/* Log tail toggle */}
          {job.log_tail.length > 0 && (
            <>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                {expanded ? "Logtı jaaw" : "Logtı kórtek"}
              </button>
              {expanded && (
                <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded text-[10px] overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {job.log_tail.join("\n")}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      {!job && (
        <p className="text-sm text-slate-400 italic">
          Házirgeshe jumıs joq. Birinshi jobtı baslań.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
