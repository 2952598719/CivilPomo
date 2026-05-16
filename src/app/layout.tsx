import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavBar } from "@/components/layout/nav-bar";
import { HydrateProvider } from "@/components/layout/hydrate-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CivilPomo",
  description: "番茄钟 × 文明科技树",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <HydrateProvider>
          <NavBar />
          <main className="mx-auto max-w-4xl p-4">{children}</main>
        </HydrateProvider>
      </body>
    </html>
  );
}
