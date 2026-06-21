import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy & affiliate disclosure", description: "How Dealora handles saved deals, analytics, and commissionable links." };

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <Link className="brand" href="/"><span className="brand-mark"><i /><i /></span><span>dealora</span></Link>
      <div className="policy-card">
        <p className="kicker">PLAIN-ENGLISH POLICY</p>
        <h1>Privacy & affiliate disclosure</h1>
        <p className="policy-lede">Short version: Dealora does not require an account, your saved deals stay in your browser, and eligible shopping links may earn Dealora a commission without changing your price.</p>

        <section><h2>Affiliate links</h2><p>Dealora may receive a commission when you make a purchase through an eligible link. That financial relationship does not increase the price you pay. Deal quality remains the primary ranking signal, and paid placements—if introduced—will be clearly labeled.</p></section>
        <section><h2>Saved deals</h2><p>Saved items are stored locally in your browser. Dealora does not receive that shortlist, and it will not automatically follow you to another browser or device.</p></section>
        <section><h2>Hosting and commerce providers</h2><p>Vercel may process ordinary request information needed to deliver and secure the site. If an affiliate-commerce integration is activated, that provider may process eligible link clicks and use tracking technologies under its own privacy terms.</p></section>
        <section><h2>What Dealora does not do</h2><p>Dealora does not handle checkout, payment information, retailer accounts, or order support. Purchases happen on the linked retailer or publisher website.</p></section>
        <section><h2>Changes</h2><p>This page will be updated when Dealora adds a material data practice or monetization partner. Last updated June 20, 2026.</p></section>
      </div>
      <Link className="policy-back" href="/">← Back to today&apos;s finds</Link>
    </main>
  );
}
