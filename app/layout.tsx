import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexiLearn — AI-Powered English Learning",
  description:
    "Nền tảng học tiếng Anh cá nhân hóa với Flashcards 3D và Trình đối thoại AI thông minh.",
};

import { AmplifyProvider } from "@/components/providers/amplify-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col">
        <AmplifyProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          </QueryProvider>
        </AmplifyProvider>
        <Toaster />
      </body>
    </html>
  );
}
