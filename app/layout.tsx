import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexiLearn — AI-Powered English Learning",
  description: "Nền tảng học tiếng Anh cá nhân hóa với Flashcards 3D và Trình đối thoại AI thông minh.",
};

import { AmplifyProvider } from "@/components/providers/amplify-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col">
        <AmplifyProvider>
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </AmplifyProvider>
        <Toaster />
      </body>
    </html>
  );
}
