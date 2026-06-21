"use client";

import { ArrowUpRight, Bookmark, Clock3, Flame } from "lucide-react";
import { DealImage } from "./deal-image";
import type { Deal } from "@/types/deal";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
}

function ageLabel(publishedAt: string, generatedAt: string) {
  const hours = Math.max(0, Math.floor((new Date(generatedAt).getTime() - new Date(publishedAt).getTime()) / 3_600_000));
  if (hours < 1) return "Just in";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DealCard({ deal, generatedAt, saved, onSave, featured = false }: {
  deal: Deal;
  generatedAt: string;
  saved: boolean;
  onSave: () => void;
  featured?: boolean;
}) {
  return (
    <article className={`deal-card${featured ? " deal-card--featured" : ""}`}>
      <div className="deal-card__visual">
        <DealImage src={deal.imageUrl} alt="" category={deal.category} eager={featured} />
        <span className={`deal-badge deal-badge--${deal.badge.toLowerCase().replaceAll(" ", "-").replace("'", "")}`}>
          {deal.badge === "Editor's pick" && <Flame size={13} fill="currentColor" />}
          {deal.badge}
        </span>
        <button className={`save-button${saved ? " is-saved" : ""}`} onClick={onSave} aria-label={saved ? `Remove ${deal.title} from saved deals` : `Save ${deal.title}`}>
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="deal-card__body">
        <div className="deal-meta">
          <span>{deal.merchant}</span><i />
          <span className="deal-age"><Clock3 size={13} />{ageLabel(deal.publishedAt, generatedAt)}</span>
        </div>
        <h3>{deal.title}</h3>
        <p className="deal-summary">{deal.summary}</p>
        <div className="price-row">
          <div>
            {deal.price !== null ? <strong>{money(deal.price)}</strong> : <strong className="price-text">See price</strong>}
            {deal.originalPrice !== null && <s>{money(deal.originalPrice)}</s>}
          </div>
          {deal.discountPercent !== null && deal.discountPercent > 0 && <span className="discount-pill">{deal.discountPercent}% off</span>}
        </div>
        <div className="card-footer">
          <div className="score" title="Dealora score blends freshness, savings, specificity, and source quality.">
            <span>{deal.score}</span><small>DEAL SCORE</small>
          </div>
          <a href={deal.url} target="_blank" rel="noopener noreferrer nofollow" className="deal-link">
            See the deal <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="source-line">Found via <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{deal.source}</a></p>
      </div>
    </article>
  );
}
