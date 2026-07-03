import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootProviders from "@/providers/root-providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Job Board Portal",
  description: "A production-ready platform to browse jobs, apply, and recruit candidates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50" suppressHydrationWarning>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
