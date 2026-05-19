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
        title="Ne ushın maqtaydı"
        items={praise}
        icon={<ThumbsUp className="size-4 text-sage" />}
        color="sage"
      />
      <Block
        title="Ne ushın shaǵımladı"
        items={complaints}
        icon={<ThumbsDown className="size-4 text-rust" />}
        color="rust"
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
  color: "sage" | "rust";
}) {
  const tagCls =
    color === "sage"
      ? "border-sage/30 bg-sage/10 text-sage-bright"
      : "border-rust/30 bg-rust/10 text-rust-bright";
  const barCls = color === "sage" ? "border-sage/40" : "border-rust/40";

  return (
    <section className="panel p-6">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-sand mb-5">
        <span className="flex size-7 items-center justify-center rounded-md border border-hairline bg-raised">
          {icon}
        </span>
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sand-faint text-sm">Eslewler joq</p>
      ) : (
        <ul className="space-y-4">
          {items.map((it, i) => (
            <li key={i}>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-medium ${tagCls}`}
                >
                  {it.aspect}
                </span>
                <span className="font-mono text-xs tabular-nums text-sand-faint">
                  score {it.score.toFixed(2)}
                </span>
              </div>
              <blockquote
                className={`border-l-2 ${barCls} pl-3 text-sm italic text-sand-dim`}
              >
                «{it.snippet}»
              </blockquote>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
