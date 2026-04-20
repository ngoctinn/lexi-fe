"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, CircleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-5" />
        ),
        info: (
          <InfoIcon className="size-5" />
        ),
        warning: (
          <CircleAlertIcon className="size-5" />
        ),
        error: (
          <OctagonXIcon className="size-5" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:relative group-[.toaster]:isolate group-[.toaster]:shadow-2xl sm:rounded-2xl overflow-hidden group-[.toaster]:p-3.5 group-[.toaster]:gap-3 group-[.toaster]:border group-[.toaster]:items-start",
          description: "group-[.toast]:text-muted-foreground leading-relaxed text-[13px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-bold group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-bold group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2",
          title: "font-medium text-[14px] leading-tight",
          default: "",
          success: "",
          error: "",
          warning: "",
          info: "",
        },
      }}
      {...props}
    />
  )
}


export { Toaster }
