import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { AspectQuote } from "@/lib/api";

export function PraiseComplaints({
  praise,
  complaints,
}: {
  praise: AspectQuote[];
  complaints: AspectQuote[];
}) {
  if (praise.length === 0 && complaints.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Block
        title="За что хвалят"
        items={praise}
        icon={<ThumbsUp className="size-5 text-green-600" />}
        color="green"
      />
      <Block
        title="За что ругают"
        items={complaints}
        icon={<ThumbsDown className="size-5 text-red-600" />}
        color="red"
      />
    </div>
  );
}

function Block({
  title,
  items,
  icon,
  color,
}: {
  title: string;
  items: AspectQuote[];
  icon: React.ReactNode;
  color: "green" | "red";
}) {
  const tagCls =
    color === "green"
      ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300"
      : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300";
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">Нет упоминаний</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${tagCls}`}>
                  {it.aspect}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  score {it.score.toFixed(2)}
                </span>
              </div>
              <blockquote className="text-sm text-slate-700 dark:text-slate-300 border-l-2 border-slate-200 dark:border-slate-700 pl-3 italic">
                «{it.snippet}»
              </blockquote>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
