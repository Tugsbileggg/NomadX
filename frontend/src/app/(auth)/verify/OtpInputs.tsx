"use client";

import { useRef } from "react";

const LENGTH = 6;

/** Six single-digit boxes that advance focus as the user types. */
export function OtpInputs() {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function focus(index: number) {
    refs.current[index]?.focus();
    refs.current[index]?.select();
  }

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length: LENGTH }, (_, i) => (
        <input
          key={i}
          name={`digit-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          required
          aria-label={`${i + 1}-р орон`}
          className="h-14 w-12 rounded-xl border border-[#6b7280] bg-white text-center text-xl font-semibold text-ink focus:border-primary focus:outline-2 focus:outline-primary"
          onChange={(e) => {
            if (e.target.value && i < LENGTH - 1) focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !e.currentTarget.value && i > 0) focus(i - 1);
            if (e.key === "ArrowLeft" && i > 0) focus(i - 1);
            if (e.key === "ArrowRight" && i < LENGTH - 1) focus(i + 1);
          }}
        />
      ))}
    </div>
  );
}
