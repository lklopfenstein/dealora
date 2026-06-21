import type { Metadata, Viewport } from "next";
import { CommerceMonetization } from "@/components/commerce-monetization";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Dealora — Great prices, minus the scavenger hunt", template: "%s · Dealora" },
  description: "A calm, beautifully organized daily edit of compelling deals from across the web.",
  keywords: ["daily deals", "online sales", "price drops", "shopping deals", "coupons"],
  openGraph: {
    title: "Dealora — The internet's best prices, one calm place",
    description: "Fresh deals gathered, deduplicated, and ranked every day.",
    type: "website",
    url: siteUrl,
    siteName: "Dealora",
  },
  twitter: { card: "summary_large_image", title: "Dealora", description: "Great prices, minus the scavenger hunt." },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = { themeColor: "#f8f6ef", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <CommerceMonetization />
      </body>
    </html>
  );
}
