const PLATFORMS = [
  { key: "facebook", envVar: "NEXT_PUBLIC_SOCIAL_FACEBOOK", label: "Facebook", initial: "f" },
  { key: "instagram", envVar: "NEXT_PUBLIC_SOCIAL_INSTAGRAM", label: "Instagram", initial: "IG" },
  { key: "youtube", envVar: "NEXT_PUBLIC_SOCIAL_YOUTUBE", label: "YouTube", initial: "YT" },
  { key: "telegram", envVar: "NEXT_PUBLIC_SOCIAL_TELEGRAM", label: "Telegram", initial: "TG" },
] as const;

const env: Record<string, string | undefined> = {
  NEXT_PUBLIC_SOCIAL_FACEBOOK: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  NEXT_PUBLIC_SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  NEXT_PUBLIC_SOCIAL_YOUTUBE: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  NEXT_PUBLIC_SOCIAL_TELEGRAM: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM,
};

export function SocialLinks({ title, label }: { title: string; label: string }) {
  const active = PLATFORMS.filter((p) => env[p.envVar]);
  if (active.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-brand-gold">{title}</p>
      <div className="mt-3 flex items-center gap-2">
        {active.map((p) => (
          <a
            key={p.key}
            href={env[p.envVar]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} — ${p.label}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-brand-cream transition-colors hover:bg-brand-gold hover:text-brand-dark"
          >
            {p.initial}
          </a>
        ))}
      </div>
    </div>
  );
}
