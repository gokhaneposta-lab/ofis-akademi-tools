"use client";

import { useEffect, useState } from "react";

type Props = {
  expiresAt: string;
  onExpire: () => void;
};

export default function ExamTimer({ expiresAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      const s = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setRemaining(s);
      if (s <= 0) onExpire();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const urgent = remaining > 0 && remaining <= 5 * 60;

  return (
    <div
      className={`rounded-lg border px-3 py-1.5 font-mono text-sm tabular-nums ${
        urgent
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : remaining === 0
            ? "border-red-300 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-800"
      }`}
      aria-live="polite"
      aria-label="Kalan süre"
    >
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
