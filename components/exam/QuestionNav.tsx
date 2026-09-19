"use client";

type Props = {
  total: number;
  currentIndex: number;
  answered: Set<number>;
  onSelect: (index: number) => void;
};

export default function QuestionNav({ total, currentIndex, answered, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const isAnswered = answered.has(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition ${
              isCurrent
                ? "bg-emerald-800 text-white ring-2 ring-emerald-800/30"
                : isAnswered
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`Soru ${i + 1}${isAnswered ? ", cevaplandı" : ""}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
