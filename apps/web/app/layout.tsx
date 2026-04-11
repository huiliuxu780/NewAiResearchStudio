import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { DataProvider } from "@/lib/data-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 研究平台",
  description: "AI 驱动的情报研究与分析平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={cn("dark", "h-full", "antialiased", geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DataProvider>
          <TooltipProvider>
            <AppLayout>{children}</AppLayout>
          </TooltipProvider>
        </DataProvider>
      </body>
    </html>
  );
}