"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-success fill-success/10" />
        ),
        info: (
          <InfoIcon className="size-5 text-info fill-info/10" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-warning fill-warning/10" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-destructive fill-destructive/10" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:relative group-[.toaster]:isolate group-[.toaster]:!bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl sm:rounded-xl overflow-hidden group-[.toaster]:p-4 group-[.toaster]:gap-5 group-[.toaster]:border group-[.toaster]:items-start",
          description: "group-[.toast]:text-muted-foreground leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-bold group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-bold group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2",
          title: "font-bold text-base leading-tight",
          default:
            "border-l-4 border-l-foreground",
          success:
            "before:absolute before:inset-0 before:-z-10 before:!bg-success/5 !border-l-4 !border-l-success",
          error:
            "before:absolute before:inset-0 before:-z-10 before:!bg-destructive/5 !border-l-4 !border-l-destructive",
          warning:
            "before:absolute before:inset-0 before:-z-10 before:!bg-warning/5 !border-l-4 !border-l-warning",
          info:
            "before:absolute before:inset-0 before:-z-10 before:!bg-info/5 !border-l-4 !border-l-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
