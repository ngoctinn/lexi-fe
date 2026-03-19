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
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:relative group-[.toaster]:isolate group-[.toaster]:!bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl sm:rounded-xl overflow-hidden group-[.toaster]:p-4 group-[.toaster]:gap-3 group-[.toaster]:border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-bold group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-bold group-[.toast]:rounded-md group-[.toast]:px-4 group-[.toast]:py-2",
          title: "font-bold",
          default:
            "!border-l-4 !border-l-foreground",
          success:
            "before:absolute before:inset-0 before:-z-10 before:!bg-success/10 !text-success !border-l-4 !border-l-success [&_[data-description]]:!text-success/80",
          error:
            "before:absolute before:inset-0 before:-z-10 before:!bg-destructive/10 !text-destructive !border-l-4 !border-l-destructive [&_[data-description]]:!text-destructive/80",
          warning:
            "before:absolute before:inset-0 before:-z-10 before:!bg-warning/10 !text-warning !border-l-4 !border-l-warning [&_[data-description]]:!text-warning/80",
          info:
            "before:absolute before:inset-0 before:-z-10 before:!bg-primary/10 !text-primary !border-l-4 !border-l-primary [&_[data-description]]:!text-primary/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
