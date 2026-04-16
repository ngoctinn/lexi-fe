import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "default" | "md" | "lg";
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
  const iconSize = showText
    ? size === "sm"
      ? 28
      : size === "lg"
        ? 44
        : 36
    : size === "sm"
      ? 36
      : size === "lg"
        ? 56
        : 48;

  return (
    <Link
      href={href}
      aria-label={showText ? undefined : "Lexi"}
      className={cn(
        "flex items-center text-primary group",
        showText ? "gap-2" : "justify-center",
        className,
      )}
    >
      <Image
        src="/logo.svg"
        alt="Lexi"
        width={iconSize}
        height={iconSize}
        priority={showText === false}
        className="shrink-0 object-contain transition-transform group-active:translate-y-0.5"
      />
      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight text-primary-700",
            size === "sm" ? "text-xl" : size === "lg" ? "text-3xl" : "text-2xl",
            textClassName,
          )}
        >
          Lexi learn
        </span>
      )}
    </Link>
  );
}
