import type { ReviewItem } from "@/lib/api";

const LABEL_RU: Record<string, string> = {
  positive: "позитив",
  neutral: "нейтрал",
  negative: "негатив",
};

const LANG_LABEL: Record<string, string> = {
  ru: "RU",
  uz: "UZ",
  uz_cyr: "UZ (кир)",
  kaa: "KAA",
  unk: "?",
};

const LABEL_CLS: Record<string, string> = {
  positive:
    "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300",
  neutral:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  negative:
    "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
};

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-slate-500 text-sm">Нет отзывов</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {reviews.map((r) => (
        <li key={r.id} className="py-4">
          <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
            {r.sentiment_label && (
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${LABEL_CLS[r.sentiment_label]}`}
              >
                {LABEL_RU[r.sentiment_label]}
                {r.sentiment_score != null && (
                  <span className="ml-1 opacity-70">
                    {r.sentiment_score.toFixed(2)}
                  </span>
                )}
              </span>
            )}
            <span className="text-xs text-slate-400 tabular-nums">
              {LANG_LABEL[r.language] || r.language}
            </span>
            {r.rating != null && (
              <span className="text-xs text-amber-500">
                {"★".repeat(r.rating)}
                <span className="text-slate-300 dark:text-slate-700">
                  {"★".repeat(5 - r.rating)}
                </span>
              </span>
            )}
            <span className="text-xs text-slate-500">
              {r.author || "анон"}
            </span>
            {r.posted_at && (
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(r.posted_at).toLocaleDateString("ru-RU")}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {r.text}
          </p>
        </li>
      ))}
    </ul>
  );
}
