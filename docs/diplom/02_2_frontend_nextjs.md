---
title: 2.2. Frontend — Next.js, TypeScript hám Recharts
chapter: 2
section: 2
pages: 8-9
---

## 2.2. Frontend: Next.js, TypeScript hám zamanagóy frontend texnologiyaları

Bizdıń platformanıń frontend (paydalanıwshı interfeysi) bólegi — bul backend'tan alınǵan maǵlıwmatlardı paydalanıwshıǵa wizualnım kórsetiw, interaktiv qılıwı hám klient-server kommunikatsiyasın ámelge asırıw moduli. Frontend bólegi web-applikatsiya retinde, brauzer arqalı qollanıladı. Bizdıń platformada frontend Next.js freymvorki, TypeScript til hám Tailwind CSS styllar arnawlı qollanıp jaratılǵan. Maǵlıwmatlardı vizualizatsiya etiw ushın Recharts kitapxanası paydalanıladı.

**Frontend texnologiyalardı tańlaw kriteriyaları**. Áhmiyetli faktorlar: Server-Side Rendering (SEO hám performance), TypeScript qollap-quwatlawı (type safety), komponent-tiykarındaǵı arxitekturawiy, server vs client components parıqı, aktiv jámáyat. Solay etip, *Next.js + TypeScript + Tailwind + Recharts* sheshimi eń sáykes.

**React kitapxanası**. React — JavaScript kitapxanası, 2013-jılda Facebook tárepinen jaylanǵan. Stack Overflow Survey 2024 boyınsha eń popular frontend kitapxanası (39%). Áhmiyetli túsinikler: Component (JSX kórinisinde funksiya yamasa klass), Props (parametrler), State (`useState`), Effects (`useEffect`), Virtual DOM (performance optimallastırıw), Hooks (React 16.8). Bizdıń platformada React tikkeley qollanılmaydı, balki Next.js arqalı.

**Next.js freymvorki**. Next.js — React tiykarındaǵı meta-freymvork, Vercel kompaniyası tárepinen 2016-jıldı jaylanǵan. Áhmiyetli ózgesheliklerі: Server-Side Rendering (SSR) — server'de HTML rendering, klient empty page kórmeydi; Static Site Generation (SSG); App Router (Next.js 13, 2022 — hıyerarxik layoutlar); file-based routing; Server Components default («zero JavaScript by default», `"use client"` direktiva interaktivlik ushın); Image optimization; TypeScript first-class. Bizdıń platformada Next.js 16 qollanıladı — async params, Turbopack, App Router'tıń tutıq optimallashtırılǵan versiyası.

**App Router'tıń ózgesheligi** (Next.js 13'tan): hıyerarxik layoutlar nested kórinisinde; Server Components default — JavaScript brauzerge sızıqlı tartışmaydı; streaming; async Server Components tikkeley async funkciya bolıp data fetch qıladı.

**TypeScript til**. TypeScript — Microsoft tárepinen 2012-jıldı jaylanǵan, JavaScript'tıń strogo tip qoyılǵan versiyası. Artıqmashılıqları: compile-time type checking, better IntelliSense, refactoring safety, documentation in types. Bizdıń platformada barlıq frontend TypeScript'ta:

```typescript
export interface DemandRow {
  product_id: number;
  name: string;
  source: string;
  category: string | null;
  rating_avg: number | null;
  reviews_count: number;
  reviews_analyzed: number;
  positive: number;
  neutral: number;
  negative: number;
  nss: number;
  popularity: number;
  aspect_penalty: number;
  demand_score: number;
  bottleneck_aspect: string | null;
}
```

**Tailwind CSS**. Tailwind v4 — utility-first CSS freymvorki: utility classes (`text-blue-500`, `p-4`, `flex items-center`), responsive (`md:flex`), dark mode (`dark:bg-slate-900`), no CSS files (JSX ishinde). Build vaqtında tek qollanılǵan klasslar bundle'ǵa keladı (purging).

**Recharts kitapxanası**. Recharts — React ushın grafik kitapxanası, D3.js poweride. Áhmiyetli komponentleri: PieChart/Pie/Cell (donut), BarChart/Bar, XAxis/YAxis/CartesianGrid, Tooltip/Legend, ResponsiveContainer. Bizdıń platformada donut (sentiment distribution) hám stacked bar (top-10 demand) ushın qollanıladı.

**Frontend strukturası**. Next.js'tıń klassikalıq jumıs strukturasi tómendegishe:

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # root layout
│   │   ├── page.tsx          # / — landing
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx      # /products
│   │   │   └── [id]/page.tsx # /products/{id}
│   ├── components/
│   │   ├── DemandTable.tsx
│   │   ├── DemandBadge.tsx
│   │   ├── ModelQualityTable.tsx
│   │   ├── CategoryDemand.tsx
│   │   ├── PraiseComplaints.tsx
│   │   ├── ReviewList.tsx
│   │   └── SentimentDonut.tsx
│   └── lib/
│       └── api.ts           # API client + TypeScript interfaces
├── public/
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

**Maǵlıwmat fetch'i**. App Router'da Server Components'da maǵlıwmat fetch'i tikkeley async function arqalı amaldǵa asıriladı. Mısalı:

```tsx
async function fetchDemand(): Promise<DemandRow[]> {
  const res = await fetch(`${API_URL}/analysis/demand-index/`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return await res.json();
}

export default async function DashboardPage() {
  const data = await fetchDemand();
  return <DemandTable rows={data} />;
}
```

`cache: "no-store"` — backend'tan hár payt taza maǵlıwmat tortıladı, klassikalıq Next.js cache'i óshiriledi.

**Server vs Client Components**. Server Components (default) — HTML tek serverde rendering, brauzerge JavaScript barmaydı (`DemandTable`). Client Components (`"use client"` direktiva menen) — brauzerde interaktiv, state, hooks. Recharts komponentleri — barlıq client'lar (DOM-manipulation kerek). Bizdıń platformada `SentimentDonut` — client, qalǵanları server.

**Code listing — DemandBadge komponentі**:

```tsx
import type { DemandRow } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001/api";

async function fetchDemand(productId: number): Promise<DemandRow | null> {
  const res = await fetch(`${API_URL}/analysis/products/${productId}/demand/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return await res.json();
}

function classify(score: number): { label: string; cls: string } {
  if (score >= 50) return { label: "Joqarı talab", cls: "bg-green-100 text-green-700" };
  if (score >= 25) return { label: "Orta talab", cls: "bg-amber-100 text-amber-700" };
  return { label: "Tómen talab", cls: "bg-red-100 text-red-700" };
}

export async function DemandBadge({ productId }: { productId: number }) {
  const d = await fetchDemand(productId);
  if (!d) return null;
  const { label, cls } = classify(d.demand_score);
  return (
    <section className="rounded-xl border bg-white p-6">
      <div className="flex items-baseline gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>
        <span className="text-4xl font-bold">{d.demand_score.toFixed(1)}</span>
        <span className="text-slate-500">/ 100</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm mt-4">
        <Stat label="Net Sentiment" value={`${d.nss > 0 ? "+" : ""}${d.nss.toFixed(2)}`} />
        <Stat label="Popularlıq" value={d.popularity.toFixed(2)} />
        <Stat label="Aspekt poprawkasi" value={`×${d.aspect_penalty.toFixed(2)}`} />
      </div>
    </section>
  );
}
```

**Code listing — SentimentDonut (client component)**:

```tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
};

export function SentimentDonut({ data }: { data: Item[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={100}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={COLORS[entry.label]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

**Frontend sahifaları**. Bizdıń platformanıń tórt sahifası: bas sahifa (`/`) — landing, navigation; dashboard (`/dashboard`) — KPI kartochkası, kategoriya boyınsha demand, model sapası kestesi, top/anti-top; tovarlar (`/products`) — listing filterleri menen; tovar detali (`/products/{id}`) — demand badge, donut, aspekt'ler, praise/complaints, so'nggi pikirler.

**Performance hám deployment**. Next.js performance: code splitting, prefetching, image optimization (`next/image`), font optimization. Production build — `pnpm build` (Turbopack). Deployment — Vercel yamasa Docker. Bizdıń platformada `pnpm` paket basqarıwshısı qollanıladı.

Solay etip, frontend zamanagóy texnologiyalar kompleksinde (Next.js 16, TypeScript, Tailwind v4, Recharts) qurılǵan. Keyingi bólekte parser hám NLP'qa ótemiz.
