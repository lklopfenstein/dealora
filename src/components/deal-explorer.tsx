"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, Bookmark, Check, ChevronRight, Menu, Search, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { CATEGORIES, type DealDataset } from "@/types/deal";
import { DealCard } from "./deal-card";
import { DealImage } from "./deal-image";

type SortKey = "smart" | "newest" | "discount";

export function DealExplorer({ dataset }: { dataset: DealDataset }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<SortKey>("smart");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [visible, setVisible] = useState(18);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try { setSaved(JSON.parse(localStorage.getItem("dealora-saved") ?? "[]")); } catch { setSaved([]); }
    });
  }, []);

  const toggleSave = (id: string) => {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("dealora-saved", JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = dataset.deals.filter((deal) => {
      const matchesQuery = !needle || `${deal.title} ${deal.summary} ${deal.merchant} ${deal.source}`.toLowerCase().includes(needle);
      const matchesCategory = category === "All" || deal.category === category;
      const matchesSaved = !savedOnly || saved.includes(deal.id);
      return matchesQuery && matchesCategory && matchesSaved;
    });
    return [...list].sort((a, b) => {
      if (sort === "newest") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (sort === "discount") return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
      return b.score - a.score;
    });
  }, [category, dataset.deals, query, saved, savedOnly, sort]);

  const heroDeal = dataset.deals[0];
  const generated = new Date(dataset.generatedAt);
  const updatedLabel = generated.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const categoryCounts = Object.fromEntries(CATEGORIES.map((item) => [item, item === "All" ? dataset.itemCount : dataset.deals.filter((deal) => deal.category === item).length]));

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Dealora home"><span className="brand-mark"><i /><i /></span><span>dealora</span></a>
        <nav className={mobileOpen ? "is-open" : ""} aria-label="Primary navigation">
          <a href="#today" onClick={() => setMobileOpen(false)}>Today&apos;s finds</a>
          <a href="#browse" onClick={() => setMobileOpen(false)}>Browse</a>
          <a href="#how" onClick={() => setMobileOpen(false)}>How it works</a>
        </nav>
        <button className={`saved-nav${savedOnly ? " is-active" : ""}`} onClick={() => { setSavedOnly(!savedOnly); setVisible(18); document.querySelector("#browse")?.scrollIntoView({ behavior: "smooth" }); }}>
          <Bookmark size={16} fill={savedOnly ? "currentColor" : "none"} /> Saved <span>{saved.length}</span>
        </button>
        <button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span><Sparkles size={13} /></span> The daily edit · Updated {updatedLabel}</div>
          <h1>Great prices,<br /><em>minus the scavenger hunt.</em></h1>
          <p>We sweep trusted corners of the web, clear out the duplicates, and surface the finds actually worth opening.</p>
          <label className="hero-search">
            <Search size={21} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(18); }} placeholder="Search deals, stores, or products" aria-label="Search deals" />
            {query && <button onClick={() => { setQuery(""); setVisible(18); }} aria-label="Clear search"><X size={17} /></button>}
          </label>
          <div className="trust-row">
            <span><Check size={14} /> {dataset.sourceCount} live sources</span>
            <span><Check size={14} /> Refreshed daily</span>
            <span><Check size={14} /> No paywall</span>
          </div>
        </div>
        <div className="hero-feature" id="today">
          <div className="hero-sticker"><Zap size={14} fill="currentColor" /> TODAY&apos;S STANDOUT</div>
          <div className="hero-image"><DealImage src={heroDeal.imageUrl} alt="" category={heroDeal.category} eager /></div>
          <div className="hero-deal-copy">
            <span>{heroDeal.merchant} · {heroDeal.category}</span>
            <h2>{heroDeal.title}</h2>
            <a href={heroDeal.url} target="_blank" rel="noopener noreferrer nofollow">Open today&apos;s top find <ChevronRight size={17} /></a>
          </div>
          <span className="hero-score">{heroDeal.score}<small>smart score</small></span>
        </div>
      </section>

      <section className="ticker" aria-label="Dealora features">
        <div><span>CURATED, NOT CROWDED</span><i>✦</i><span>REAL SOURCES, CLEAR LINKS</span><i>✦</i><span>FRESH EVERY MORNING</span><i>✦</i><span>SAVINGS WITHOUT THE NOISE</span></div>
      </section>

      <section className="browse-section" id="browse">
        <div className="section-heading">
          <div><p className="kicker">THE GOOD STUFF</p><h2>{savedOnly ? "Your saved finds" : query ? `Results for “${query}”` : "Today’s best finds"}</h2></div>
          <p>{savedOnly ? "Your shortlist lives in this browser—simple and private." : <><strong className="commission-note">Dealora may earn from eligible purchases; your price doesn&apos;t change.</strong> Ranked by freshness, price clarity, source quality, and the size of the drop.</>}</p>
        </div>

        <div className="filter-bar">
          <div className="category-pills" role="tablist" aria-label="Deal categories">
            {CATEGORIES.map((item) => (
              <button key={item} onClick={() => { setCategory(item); setVisible(18); }} className={category === item ? "is-active" : ""} role="tab" aria-selected={category === item}>
                {item}<span>{categoryCounts[item]}</span>
              </button>
            ))}
          </div>
          <label className="sort-select">Sort <select value={sort} onChange={(event) => { setSort(event.target.value as SortKey); setVisible(18); }}><option value="smart">Smart pick</option><option value="newest">Newest</option><option value="discount">Biggest drop</option></select><ArrowDown size={15} /></label>
        </div>

        {filtered.length ? (
          <>
            <div className="deal-grid">
              {filtered.slice(0, visible).map((deal, index) => (
                <DealCard key={deal.id} deal={deal} generatedAt={dataset.generatedAt} saved={saved.includes(deal.id)} onSave={() => toggleSave(deal.id)} featured={index === 0 && !query && category === "All" && !savedOnly} />
              ))}
            </div>
            {visible < filtered.length && <button className="load-more" onClick={() => setVisible((value) => value + 18)}>Show me more <ArrowDown size={17} /></button>}
          </>
        ) : (
          <div className="empty-state"><Search size={36} /><h3>No treasures hiding here—yet.</h3><p>Try a broader search or another category.</p><button onClick={() => { setQuery(""); setCategory("All"); setSavedOnly(false); }}>Clear filters</button></div>
        )}
      </section>

      <section className="how-section" id="how">
        <div className="how-intro"><p className="kicker">LESS NOISE, BETTER FINDS</p><h2>Deal hunting,<br /><em>thoughtfully automated.</em></h2><p>No votes to game, no endless comment threads, no mystery redirects. Just a clean daily scan with the receipts attached.</p></div>
        <div className="how-steps">
          <article><span>01</span><div><Search /><h3>We sweep widely</h3><p>Public deal feeds and trusted editorial sources are checked in parallel every day.</p></div></article>
          <article><span>02</span><div><Sparkles /><h3>We clear the clutter</h3><p>Duplicates, stale posts, and vague offers get pushed aside by a transparent quality score.</p></div></article>
          <article><span>03</span><div><ShieldCheck /><h3>You shop at the source</h3><p>Every find names its source and opens there. Dealora never handles your checkout or payment.</p></div></article>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div><a className="brand brand--footer" href="#top"><span className="brand-mark"><i /><i /></span><span>dealora</span></a><p>The internet&apos;s best prices.<br />One calm place.</p></div>
          <div><h4>Browse</h4>{CATEGORIES.slice(1).map((item) => <button key={item} onClick={() => { setCategory(item); setSavedOnly(false); setVisible(18); document.querySelector("#browse")?.scrollIntoView({ behavior: "smooth" }); }}>{item}</button>)}</div>
          <div><h4>Live sources</h4>{dataset.sourceHealth.filter((source) => source.status === "ok").slice(0, 6).map((source) => <span key={source.name}>{source.name}</span>)}</div>
          <div><h4>The small print</h4><p>Prices and availability can change. Always confirm details at the retailer. Dealora may earn from qualifying links, at no added cost to you.</p><a href="/privacy">Privacy & affiliate disclosure</a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getUTCFullYear()} Dealora</span><span>Built to save time, not collect it.</span></div>
      </footer>
    </main>
  );
}
