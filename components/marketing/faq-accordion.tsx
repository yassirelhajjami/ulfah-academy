"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/i18n/dictionary-type";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brand-dark/10 rounded-2xl border border-brand-dark/10 bg-white">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-brand-green/5"
              aria-expanded={open}
            >
              <span className="font-semibold text-brand-dark">{item.question}</span>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center text-xl text-brand-gold transition-transform duration-300"
                style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-6 text-brand-dark/70">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
