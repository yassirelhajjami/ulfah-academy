"use client";

import { useEffect, useState } from "react";

export function SectionQuickNav({ items }: { items: { id: string; label: string }[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    const heroEl = document.getElementById("hero");
    const heroObserver = heroEl
      ? new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 })
      : null;
    if (heroEl && heroObserver) heroObserver.observe(heroEl);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((e) => e.isIntersecting);
        if (visibleEntry) setActiveId(visibleEntry.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((el) => sectionObserver.observe(el));

    return () => {
      heroObserver?.disconnect();
      sectionObserver.disconnect();
    };
  }, [items]);

  return (
    <div
      className={`sticky top-20 z-30 mx-auto hidden w-fit justify-center transition-all duration-300 sm:flex ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <nav className="flex items-center gap-1 rounded-full border border-brand-dark/10 bg-white/90 p-1.5 shadow-lg backdrop-blur">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activeId === item.id ? "bg-brand-green text-white" : "text-brand-dark/70 hover:bg-brand-green/10"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
