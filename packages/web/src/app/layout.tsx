import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TrackingScripts from "@/components/layout/TrackingScripts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "818 Capital Partners | Investor Lending — DSCR, Flip, STR, Multifamily",
  description: "Smart financing for real estate investors. Enter your deal numbers, get an instant score, matching lenders, and clear next steps. No tax returns. No runaround.",
  keywords: "DSCR loans, fix and flip loans, short term rental financing, multifamily loans, investment property loans, no tax return loans, real estate investor lending",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        {children}
        <TrackingScripts />
      </body>
    </html>
  );
}
