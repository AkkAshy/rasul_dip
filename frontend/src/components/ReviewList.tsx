import type { ReviewItem } from "@/lib/api";

const LABEL_KAA: Record<string, string> = {
  positive: "pozitiv",
  neutral: "neytral",
  negative: "negativ",
};

const LANG_LABEL: Record<string, string> = {
  ru: "RU",
  uz: "UZ",
  uz_cyr: "UZ (kir)",
  kaa: "KAA",
  unk: "?",
};

const LABEL_CLS: Record<string, string> = {
  positive: "border-sage/30 bg-sage/10 text-sage-bright",
  neutral: "border-hairline bg-raised text-sand-dim",
  negative: "border-rust/30 bg-rust/10 text-rust-bright",
};

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-sand-faint text-sm">Pikirler joq</p>;
  }

  return (
    <ul className="divide-y divide-hairline-soft">
      {reviews.map((r) => (
        <li key={r.id} className="py-4 first:pt-0 last:pb-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {r.sentiment_label && (
              <span
                className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                  LABEL_CLS[r.sentiment_label]
                }`}
              >
                {LABEL_KAA[r.sentiment_label]}
                {r.sentiment_score != null && (
                  <span className="ml-1 font-mono opacity-70">
                    {r.sentiment_score.toFixed(2)}
                  </span>
                )}
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wider text-sand-faint">
              {LANG_LABEL[r.language] || r.language}
            </span>
            {r.rating != null && (
              <span className="text-xs text-honey">
                {"★".repeat(r.rating)}
                <span className="text-hairline">
                  {"★".repeat(5 - r.rating)}
                </span>
              </span>
            )}
            <span className="text-xs text-sand-faint">
              {r.author || "anon"}
            </span>
            {r.posted_at && (
              <span className="ml-auto font-mono text-xs text-sand-faint">
                {new Date(r.posted_at).toLocaleDateString("uz-UZ")}
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-sand-dim">
            {r.text}
          </p>
        </li>
      ))}
    </ul>
  );
}
