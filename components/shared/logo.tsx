import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  textClassName?: string
  size?: "sm" | "default" | "lg"
  href?: string
}

export function Logo({ className, textClassName, size = "default", href = "/" }: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 text-primary group", className)}>
      <div
        className={cn(
          "bg-primary flex shrink-0 items-center justify-center transition-transform group-active:translate-y-0.5",
          size === "sm" ? "size-7 rounded-md shadow-[0_2px_0_0_var(--color-primary-shadow)] group-active:shadow-none" :
            size === "lg" ? "size-10 rounded-xl shadow-[0_2px_0_0_var(--color-primary-shadow)] group-active:shadow-none" :
              "size-9 rounded-xl shadow-[0_2px_0_0_var(--color-primary-shadow)] group-active:shadow-none"
        )}
      >
        <GraduationCap
          className="text-primary-foreground"
          style={{
            width: size === "sm" ? 16 : size === "lg" ? 24 : 20,
            height: size === "sm" ? 16 : size === "lg" ? 24 : 20
          }}
        />
      </div>
      <span
        className={cn(
          "font-semibold tracking-tight text-primary-900",
          size === "sm" ? "text-lg" :
            size === "lg" ? "text-2xl" :
              "text-xl",
          textClassName
        )}
      >
        LexiLearn
      </span>
    </Link>
  )
}
