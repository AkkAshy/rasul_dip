import Link from "next/link";
import { TrendingUp, BarChart3, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Pikirler tiykarındaǵı talab indeksi
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Klient pikirlerine sentimental analiz qollap, Uzum&nbsp;Market
            tovarları talabın anıglaytuǵın platforma.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            href="/dashboard"
            icon={<BarChart3 className="size-6" />}
            title="Dashboard"
            desc="Talab indeksi hám tónlik barlıq tovarlar boyınsha"
          />
          <FeatureCard
            href="/products"
            icon={<MessageSquare className="size-6" />}
            title="Tovarlar"
            desc="Jıynalǵan pikirleri bar tovarlar dizimi"
          />
          <FeatureCard
            href="/dashboard#demand"
            icon={<TrendingUp className="size-6" />}
            title="Joqarı talab"
            desc="Eń kóp satılatuǵın hám maqtanatuǵın tovarlar"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
    >
      <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </Link>
  );
}
