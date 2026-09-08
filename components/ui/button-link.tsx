import Link from "next/link";

type Variant = "primary" | "gold" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-brand-green text-white hover:bg-brand-green-dark shadow-sm hover:shadow-md",
  gold: "bg-brand-gold text-brand-dark hover:brightness-95 shadow-sm hover:shadow-md",
  outline: "border border-brand-green text-brand-green hover:bg-brand-green hover:text-white",
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
