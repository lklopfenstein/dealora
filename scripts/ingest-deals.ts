import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import type { Category, Deal, DealDataset } from "../src/types/deal";

type FeedSource = {
  name: string;
  url: string;
  homepage: string;
  trust: number;
  maxItems: number;
};

const SOURCES: FeedSource[] = [
  { name: "Slickdeals", url: "https://slickdeals.net/newsearch.php?rss=1&searcharea=deals&searchin=first&sort=newest", homepage: "https://slickdeals.net", trust: 15, maxItems: 28 },
  { name: "DealNews", url: "https://www.dealnews.com/?rss=1", homepage: "https://www.dealnews.com", trust: 16, maxItems: 24 },
  { name: "Ben's Bargains", url: "https://bensbargains.com/rss/", homepage: "https://bensbargains.com", trust: 16, maxItems: 24 },
  { name: "9to5Toys", url: "https://9to5toys.com/feed/", homepage: "https://9to5toys.com", trust: 14, maxItems: 18 },
  { name: "Tom's Guide Deals", url: "https://www.tomsguide.com/feeds/tag/deals", homepage: "https://www.tomsguide.com/deals", trust: 13, maxItems: 14 },
  { name: "Android Authority Deals", url: "https://www.androidauthority.com/deals/feed/", homepage: "https://www.androidauthority.com/deals", trust: 13, maxItems: 14 },
  { name: "Digital Trends Deals", url: "https://www.digitaltrends.com/dtdeals/feed/", homepage: "https://www.digitaltrends.com/dtdeals/", trust: 13, maxItems: 14 },
  { name: "Laptop Mag Deals", url: "https://www.laptopmag.com/feeds/tag/deals", homepage: "https://www.laptopmag.com/deals", trust: 12, maxItems: 12 },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "#cdata",
  parseTagValue: false,
  trimValues: true,
});

const outputPath = path.join(process.cwd(), "src", "data", "deals.json");

function arrayify<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function asText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  return asText(record["#cdata"] ?? record["#text"] ?? record["@_href"] ?? "");
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#0*38;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string): string {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeUrl(value: string, base?: string): string | null {
  try {
    if (!value.trim()) return null;
    const decoded = decodeEntities(value);
    const withProtocol = decoded.startsWith("//") ? `https:${decoded}` : decoded;
    const url = new URL(withProtocol, base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function extractImage(item: Record<string, unknown>, html: string, base: string): string | null {
  const candidates: unknown[] = [
    (item.enclosure as Record<string, unknown> | undefined)?.["@_url"],
    (item["media:content"] as Record<string, unknown> | undefined)?.["@_url"],
    (item["media:thumbnail"] as Record<string, unknown> | undefined)?.["@_url"],
    (item.thumbnail as Record<string, unknown> | undefined)?.["@_url"],
  ];
  const htmlMatch = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i)?.[1];
  if (htmlMatch) candidates.push(htmlMatch);
  for (const candidate of candidates) {
    const url = safeUrl(asText(candidate), base);
    if (url && !/pixel|tracking|spacer|logo/i.test(url)) return url;
  }
  return null;
}

function extractPrices(title: string, description: string) {
  const text = `${title} ${description.slice(0, 400)}`;
  const values = [...text.matchAll(/\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/g)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((value) => value > 0 && value < 100000);
  const percent = [...text.matchAll(/(?:save\s+|up to\s+|\b)(\d{1,2})%\s*off/gi)]
    .map((match) => Number(match[1]))
    .find((value) => value >= 5 && value <= 95);
  const titleValues = [...title.matchAll(/\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/g)].map((match) => Number(match[1].replace(/,/g, "")));
  const price = titleValues.length ? (titleValues.at(-1) ?? null) : (values.at(-1) ?? null);
  const explicitOriginal = [
    /(?:was|regularly|reg\.?|list price|normally)\s*\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/i,
    /(?:on sale )?for\s*\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)\s*[-–]\s*(?:\$|\d+%)/i,
  ]
    .map((pattern) => text.match(pattern)?.[1])
    .find(Boolean);
  const titleOriginal = titleValues.length >= 2 && titleValues[0] > (price ?? 0) * 1.08 ? titleValues[0] : null;
  const parsedOriginal = explicitOriginal ? Number(explicitOriginal.replace(/,/g, "")) : null;
  const originalPrice = price !== null && parsedOriginal && parsedOriginal > price * 1.08 ? parsedOriginal : titleOriginal;
  const discountPercent = percent ?? (price && originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null);
  return { price, originalPrice, discountPercent };
}

function categoryFor(text: string): Category {
  const value = text.toLowerCase();
  if (/flight|hotel|travel|vacation|airline|cruise|luggage/.test(value)) return "Travel";
  if (/gaming|xbox|playstation|nintendo|steam|controller|video game/.test(value)) return "Gaming";
  if (/laptop|phone|tablet|tv\b|monitor|headphone|earbud|camera|apple|android|ssd|usb|computer|speaker|tech/.test(value)) return "Tech";
  if (/shirt|shoe|jacket|dress|nike|adidas|apparel|sneaker|watch|style|beauty/.test(value)) return "Style";
  if (/furniture|kitchen|mattress|vacuum|home|garden|tool|grill|appliance|towel/.test(value)) return "Home";
  return "Everyday";
}

function merchantFor(text: string, source: string): string {
  const matchers: Array<[RegExp, string]> = [
    [/amazon/i, "Amazon"], [/walmart/i, "Walmart"], [/best buy/i, "Best Buy"], [/target/i, "Target"],
    [/ebay/i, "eBay"], [/costco/i, "Costco"], [/home depot/i, "Home Depot"], [/lowe'?s/i, "Lowe's"],
    [/newegg/i, "Newegg"], [/nike/i, "Nike"], [/woot/i, "Woot"], [/dick'?s/i, "Dick's Sporting Goods"],
  ];
  return matchers.find(([regex]) => regex.test(text))?.[1] ?? source;
}

function scoreDeal(title: string, summary: string, publishedAt: string, trust: number, discount: number | null): number {
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 3_600_000);
  const freshness = Math.max(0, 34 - ageHours * 0.65);
  const savings = Math.min(28, (discount ?? 0) * 0.55);
  const text = `${title} ${summary}`.toLowerCase();
  const intent = /deal|sale|save|off|coupon|clearance|free shipping|price drop/.test(text) ? 8 : 2;
  const specificity = /\$\s?\d/.test(title) ? 8 : 1;
  return Math.max(1, Math.min(99, Math.round(freshness + savings + trust + intent + specificity)));
}

function badgeFor(score: number, discount: number | null, publishedAt: string): Deal["badge"] {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
  if (score >= 82) return "Editor's pick";
  if ((discount ?? 0) >= 25) return "Price drop";
  if (ageHours <= 8) return "Fresh find";
  return "Worth a look";
}

function fingerprint(value: string): string {
  return createHash("sha1").update(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()).digest("hex").slice(0, 14);
}

function normalizeItem(item: Record<string, unknown>, source: FeedSource): Deal | null {
  const title = stripHtml(asText(item.title)).replace(/^\s*(deal|sale)\s*:\s*/i, "").replace(/\s+/g, " ").trim().slice(0, 180);
  const linkObject = item.link as Record<string, unknown> | undefined;
  const url = safeUrl(asText(item.link) || asText(linkObject?.["@_href"]), source.homepage);
  if (!title || !url || title.length < 12) return null;
  const content = asText(item["content:encoded"] ?? item.content ?? item.summary);
  const descriptionHtml = asText(item.description ?? item.summary ?? item.content);
  const summary = stripHtml(descriptionHtml || content).slice(0, 230);
  const parsedDate = new Date(asText(item.pubDate ?? item.published ?? item.updated ?? item.date));
  const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
  const { price, originalPrice, discountPercent } = extractPrices(title, summary);
  const score = scoreDeal(title, summary, publishedAt, source.trust, discountPercent);
  const allText = `${title} ${summary}`;
  return {
    id: fingerprint(`${source.name}:${asText(item.guid) || url}`), title,
    summary: summary || "A fresh offer worth a closer look. Check the source for current pricing and availability.",
    url, imageUrl: extractImage(item, `${content} ${descriptionHtml}`, source.homepage), source: source.name,
    sourceUrl: source.homepage, merchant: merchantFor(allText, source.name), category: categoryFor(allText),
    price, originalPrice, discountPercent, publishedAt, score, badge: badgeFor(score, discountPercent, publishedAt),
  };
}

async function fetchSource(source: FeedSource): Promise<Deal[]> {
  const response = await fetch(source.url, {
    headers: { Accept: "application/rss+xml, application/atom+xml, text/xml, application/xml", "User-Agent": "DealoraBot/1.0 (+https://github.com/lklopfenstein/dealora)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const parsed = parser.parse(await response.text()) as Record<string, unknown>;
  const rss = parsed.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const atom = parsed.feed as Record<string, unknown> | undefined;
  const items = arrayify((channel?.item ?? atom?.entry) as Record<string, unknown> | Record<string, unknown>[] | undefined);
  return items.slice(0, source.maxItems).map((item) => normalizeItem(item, source)).filter((deal): deal is Deal => Boolean(deal));
}

function dedupeAndRank(deals: Deal[]): Deal[] {
  const seen = new Set<string>();
  return deals
    .sort((a, b) => b.score - a.score || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((deal) => {
      const titleKey = deal.title.toLowerCase().replace(/\$\s?[0-9,.]+|\b(deal|sale|off|free shipping|at amazon|at ebay)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, 10).join(" ");
      if (!titleKey || seen.has(titleKey)) return false;
      seen.add(titleKey);
      return true;
    })
    .slice(0, 96);
}

async function readPrevious(): Promise<DealDataset | null> {
  try { return JSON.parse(await readFile(outputPath, "utf8")) as DealDataset; } catch { return null; }
}

async function main() {
  console.log(`Refreshing ${SOURCES.length} deal sources...`);
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const sourceHealth: DealDataset["sourceHealth"] = [];
  const freshDeals: Deal[] = [];
  results.forEach((result, index) => {
    const source = SOURCES[index];
    if (result.status === "fulfilled") {
      sourceHealth.push({ name: source.name, status: "ok", itemCount: result.value.length });
      freshDeals.push(...result.value);
      console.log(`✓ ${source.name}: ${result.value.length}`);
    } else {
      sourceHealth.push({ name: source.name, status: "error", itemCount: 0 });
      console.warn(`✗ ${source.name}: ${result.reason instanceof Error ? result.reason.message : "Unknown error"}`);
    }
  });
  const previous = await readPrevious();
  const failedSources = new Set(sourceHealth.filter((source) => source.status === "error").map((source) => source.name));
  const recentPrevious = (previous?.deals ?? []).filter(
    (deal) => failedSources.has(deal.source) && Date.now() - new Date(deal.publishedAt).getTime() < 72 * 3_600_000,
  );
  const deals = dedupeAndRank([...freshDeals, ...recentPrevious]);
  if (deals.length < 12) throw new Error(`Only ${deals.length} deals were collected; refusing to overwrite a healthy dataset.`);
  const dataset: DealDataset = {
    generatedAt: new Date().toISOString(), sourceCount: sourceHealth.filter((source) => source.status === "ok").length,
    itemCount: deals.length, deals, sourceHealth,
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Saved ${deals.length} ranked deals from ${dataset.sourceCount} live sources.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
