import * as React from "react"
import { Logo } from "@/components/shared/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/20 p-6 md:p-10">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
