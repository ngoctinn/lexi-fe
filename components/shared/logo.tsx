import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
}

export function Logo({
  className,
  textClassName,
  size = "md",
  href = "/",
  showText = true,
}: LogoProps) {
  const iconSize =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";

  return (
    <Link
      href={href}
      aria-label={showText ? undefined : "Lexi"}
      className={cn(
        "flex items-center group",
        showText ? "gap-2" : "justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
          iconSize,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-2/3 h-2/3 text-primary"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight text-primary",
            size === "sm" ? "text-2xl" : size === "lg" ? "text-4xl" : "text-3xl",
            textClassName,
          )}
        >
          Lexi learn
        </span>
      )}
    </Link>
  );
}
