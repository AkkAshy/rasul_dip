import Link from "next/link";
import { TrendingUp, BarChart3, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Индекс спроса по&nbsp;отзывам
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Определение спроса на продукт через сентимент-анализ
            клиентских отзывов с&nbsp;маркетплейса Uzum&nbsp;Market.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            href="/dashboard"
            icon={<BarChart3 className="size-6" />}
            title="Дашборд"
            desc="Индекс спроса и тональность по всем продуктам"
          />
          <FeatureCard
            href="/products"
            icon={<MessageSquare className="size-6" />}
            title="Продукты"
            desc="Список товаров с собранными отзывами"
          />
          <FeatureCard
            href="/dashboard#demand"
            icon={<TrendingUp className="size-6" />}
            title="Топ спроса"
            desc="Что покупают и хвалят чаще всего"
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
