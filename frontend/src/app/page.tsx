import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        {/* Hero */}
        <header className="mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-clay">
            <span className="size-1.5 rounded-full bg-clay shadow-[0_0_10px_rgba(201,122,74,0.8)]" />
            Uzum Market · Sentiment Intelligence
          </div>

          <h1 className="font-display mt-7 text-5xl md:text-7xl font-extrabold leading-[0.98] text-sand">
            Pikirler tiykarında
            <br />
            <span className="text-clay glow-clay">talab indeksi</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-sand-dim">
            Klient pikirlerine sentimental analiz qollap, Uzum&nbsp;Market
            tovarları talabın anıqlaytuǵın platforma. Populyarlıq,
            qanaatlanıwshılıq hám aspekt-analiz — bir kompozit ball ishinde.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-clay px-5 py-3 text-sm font-semibold text-night transition-all hover:bg-clay-bright hover:shadow-[0_10px_30px_-10px_rgba(201,122,74,0.7)]"
            >
              Dashboardqa ótiw
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-panel px-5 py-3 text-sm font-medium text-sand transition-all hover:border-clay-deep"
            >
              Tovarlardı kóriw
            </Link>
          </div>
        </header>

        {/* Метрики-полоса */}
        <div className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-4 stagger">
          <StatCell value="100" unit="ball" label="Demand Score shkalası" />
          <StatCell value="4" unit="aspekt" label="Jetkeriw · Baha · Sapa · Qadoq" />
          <StatCell value="3" unit="til" label="ru · uz · kaa qollawı" />
          <StatCell value="ABSA" unit="" label="Aspekt-tiykarlı analiz" />
        </div>

        {/* Карточки разделов */}
        <div className="grid gap-5 md:grid-cols-3 stagger">
          <FeatureCard
            href="/dashboard"
            icon={<BarChart3 className="size-5" />}
            kicker="01"
            title="Dashboard"
            desc="Barlıq tovarlar boyınsha talab indeksi, kategoriya kesimi hám model sapası"
          />
          <FeatureCard
            href="/products"
            icon={<MessageSquare className="size-5" />}
            kicker="02"
            title="Tovarlar"
            desc="Jıynalǵan pikirleri bar tovarlar dizimi, filtr hám izlew menen"
          />
          <FeatureCard
            href="/dashboard#demand"
            icon={<TrendingUp className="size-5" />}
            kicker="03"
            title="Joqarı talab"
            desc="Eń kóp satılatuǵın hám klient maqtaytuǵın tovarlar reytingi"
          />
        </div>
      </div>
    </main>
  );
}

function StatCell({
  value,
  unit,
  label,
}: {
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="animate-fade-up bg-panel p-6">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-bold tabular-nums text-sand">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-clay">{unit}</span>}
      </div>
      <div className="mt-2 text-xs leading-snug text-sand-faint">{label}</div>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  kicker,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="panel panel-hover group animate-fade-up p-7">
      <div className="flex items-center justify-between">
        <div className="flex size-11 items-center justify-center rounded-lg border border-hairline bg-raised text-clay transition-transform group-hover:scale-110">
          {icon}
        </div>
        <span className="font-mono text-xs text-sand-faint">{kicker}</span>
      </div>
      <h3 className="font-display mt-6 text-xl font-bold text-sand">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-sand-dim">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-clay opacity-0 transition-opacity group-hover:opacity-100">
        Ashıw <ArrowUpRight className="size-3.5" />
      </div>
    </Link>
  );
}
