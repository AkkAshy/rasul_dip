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

const KIND_PRESETS: Record<
  JobKind,
  { label: string; params: Record<string, unknown>; desc: string }
> = {
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
    desc: "Hár pikirde 4 aspekt (jetkeriw, baha, sapa, qadoq) izlenedi.",
  },
};

function statusBadge(status: ScraperJob["status"]) {
  const map: Record<
    string,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    pending: {
      cls: "border-hairline bg-raised text-sand-dim",
      icon: <Loader2 className="size-3 animate-spin" />,
      label: "Kútilmoqda",
    },
    running: {
      cls: "border-clay/30 bg-clay/10 text-clay-bright",
      icon: <Loader2 className="size-3 animate-spin" />,
      label: "Islaytur",
    },
    success: {
      cls: "border-sage/30 bg-sage/10 text-sage-bright",
      icon: <Check className="size-3" />,
      label: "Tamam",
    },
    failed: {
      cls: "border-rust/30 bg-rust/10 text-rust-bright",
      icon: <X className="size-3" />,
      label: "Qátegi",
    },
  };
  const { cls, icon, label } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
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

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (job?.status !== "running" && job?.status !== "pending") return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [job?.status]);

  async function refresh() {
    try {
      const res = await fetch(`${API_URL}/scraper/latest/`, {
        cache: "no-store",
      });
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
  const fieldCls =
    "rounded-lg border border-hairline bg-night px-3.5 py-2.5 text-sm text-sand outline-none transition-colors focus:border-clay disabled:opacity-50";

  return (
    <section className="panel p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-sand mb-1">
            Maǵlıwmat jıynaw paneli
          </h2>
          <p className="text-sm text-sand-dim">
            Uzum Marketʼtan jańa pikirlerdi tortıw hám ML pipelineʼin baslaw.
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-md border border-hairline bg-raised p-2 text-sand-dim transition-colors hover:border-clay-deep hover:text-clay"
          title="Jangartıw"
        >
          <RefreshCcw className="size-4" />
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <select
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value as JobKind)}
          disabled={isRunning}
          className={fieldCls}
        >
          {(
            Object.entries(KIND_PRESETS) as [
              JobKind,
              (typeof KIND_PRESETS)[JobKind]
            ][]
          ).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        <button
          onClick={startJob}
          disabled={isRunning || starting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-clay px-5 py-2.5 text-sm font-semibold text-night transition-all hover:bg-clay-bright disabled:cursor-not-allowed disabled:bg-hairline disabled:text-sand-faint"
        >
          {starting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {isRunning ? "Jumıs ámelge asırılıp atır..." : "Skrabber baslaw"}
        </button>
      </div>

      <p className="mb-4 text-xs text-sand-faint leading-relaxed">
        {KIND_PRESETS[selectedKind].desc}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 text-sm text-rust-bright">
          {error}
        </div>
      )}

      {job && (
        <div className="rounded-lg border border-hairline bg-night p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-sand-faint">
                #{job.id}
              </span>
              <span className="text-xs text-sand-dim">{job.kind_label}</span>
              {statusBadge(job.status)}
            </div>
            {job.duration_seconds != null && (
              <span className="font-mono text-xs tabular-nums text-sand-faint">
                {job.duration_seconds.toFixed(1)}s
              </span>
            )}
          </div>

          <div className="mb-2 grid grid-cols-3 gap-3">
            <Stat label="Jańa tovar" value={job.products_added} />
            <Stat label="Jańa pikir" value={job.reviews_added} />
            <Stat label="Analiz" value={job.sentiment_analyzed} />
          </div>

          {job.error && (
            <div className="mt-2 font-mono text-xs text-rust-bright">
              {job.error}
            </div>
          )}

          {job.log_tail.length > 0 && (
            <>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 font-mono text-xs text-clay transition-colors hover:text-clay-bright"
              >
                {expanded ? "▾ Logtı jaaw" : "▸ Logtı kórtek"}
              </button>
              {expanded && (
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-hairline bg-raised p-3 text-[10px] leading-relaxed text-sand-dim">
                  {job.log_tail.join("\n")}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      {!job && (
        <p className="text-sm italic text-sand-faint">
          Házirgeshe jumıs joq. Birinshi jobtı baslań.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-sand-faint">
        {label}
      </div>
      <div className="font-mono text-lg font-semibold tabular-nums text-sand">
        {value}
      </div>
    </div>
  );
}
