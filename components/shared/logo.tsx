import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "default" | "md" | "lg";
  href?: string;
  showText?: boolean;
  loading?: "lazy" | "eager";
}

export function Logo({
  className,
  textClassName,
  size = "md",
  href = "/",
  showText = true,
  loading,
}: LogoProps) {
  const imageLoading = loading ?? (showText ? "lazy" : "eager");

  const iconSize = showText
    ? size === "sm"
      ? 32
      : size === "lg"
        ? 52
        : 42
    : size === "sm"
      ? 42
      : size === "lg"
        ? 64
        : 52;

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
        loading={imageLoading}
        className="shrink-0 object-contain transition-transform group-active:translate-y-0.5"
      />
      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight text-primary-700",
            size === "sm"
              ? "text-2xl"
              : size === "lg"
                ? "text-4xl"
                : "text-3xl",
            textClassName,
          )}
        >
          Lexi learn
        </span>
      )}
    </Link>
  );
}
