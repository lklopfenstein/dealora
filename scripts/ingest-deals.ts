import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { isSpecificProductDeal } from "../src/lib/deal-quality";
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
  { name: "TechRadar Deals", url: "https://www.techradar.com/feeds/tag/deals", homepage: "https://www.techradar.com/deals", trust: 13, maxItems: 14 },
  { name: "Tom's Hardware Deals", url: "https://www.tomshardware.com/feeds/tag/deals", homepage: "https://www.tomshardware.com/deals", trust: 13, maxItems: 14 },
  { name: "PC Gamer Deals", url: "https://www.pcgamer.com/feeds/tag/deals", homepage: "https://www.pcgamer.com/hardware/deals/", trust: 12, maxItems: 12 },
  { name: "GamesRadar Deals", url: "https://www.gamesradar.com/feeds/tag/deals", homepage: "https://www.gamesradar.com/deals/", trust: 12, maxItems: 12 },
  { name: "Windows Central Deals", url: "https://www.windowscentral.com/feeds/tag/deals", homepage: "https://www.windowscentral.com/deals", trust: 13, maxItems: 14 },
  { name: "What Hi-Fi? Deals", url: "https://www.whathifi.com/feeds/tag/deals", homepage: "https://www.whathifi.com/deals", trust: 13, maxItems: 12 },
  { name: "T3 Deals", url: "https://www.t3.com/feeds/tag/deals", homepage: "https://www.t3.com/deals", trust: 11, maxItems: 10 },
  { name: "Creative Bloq Deals", url: "https://www.creativebloq.com/feeds/tag/deals", homepage: "https://www.creativebloq.com/deals", trust: 11, maxItems: 10 },
  { name: "Live Science Deals", url: "https://www.livescience.com/feeds/tag/deals", homepage: "https://www.livescience.com/deals", trust: 11, maxItems: 10 },
  { name: "Space.com Deals", url: "https://www.space.com/feeds/tag/deals", homepage: "https://www.space.com/deals", trust: 12, maxItems: 10 },
  { name: "Cycling Weekly Deals", url: "https://www.cyclingweekly.com/feeds/tag/deals", homepage: "https://www.cyclingweekly.com/deals", trust: 11, maxItems: 10 },
  { name: "Golf Monthly Deals", url: "https://www.golfmonthly.com/feeds/tag/deals", homepage: "https://www.golfmonthly.com/deals", trust: 11, maxItems: 10 },
  { name: "Real Homes Deals", url: "https://www.realhomes.com/feeds/tag/deals", homepage: "https://www.realhomes.com/deals", trust: 11, maxItems: 10 },
  { name: "Top Ten Reviews Deals", url: "https://www.toptenreviews.com/feeds/tag/deals", homepage: "https://www.toptenreviews.com/deals", trust: 11, maxItems: 10 },
  { name: "MusicRadar Deals", url: "https://www.musicradar.com/feeds/tag/deals", homepage: "https://www.musicradar.com/deals", trust: 12, maxItems: 10 },
  { name: "Guitar World Deals", url: "https://www.guitarworld.com/feeds/tag/deals", homepage: "https://www.guitarworld.com/deals", trust: 12, maxItems: 10 },
  { name: "Advnture Deals", url: "https://www.advnture.com/feeds/tag/deals", homepage: "https://www.advnture.com/deals", trust: 11, maxItems: 10 },
  { name: "Digital Camera World Deals", url: "https://www.digitalcameraworld.com/feeds/tag/deals", homepage: "https://www.digitalcameraworld.com/deals", trust: 12, maxItems: 10 },
  { name: "BGR Deals", url: "https://bgr.com/deals/feed/", homepage: "https://bgr.com/deals/", trust: 11, maxItems: 10 },
  { name: "Cult of Mac Deals", url: "https://www.cultofmac.com/category/deals/feed", homepage: "https://www.cultofmac.com/category/deals", trust: 11, maxItems: 10 },
  { name: "Engadget Deals", url: "https://www.engadget.com/rss.xml?tags=deals", homepage: "https://www.engadget.com/deals/", trust: 13, maxItems: 12 },
  { name: "Macworld Deals", url: "https://www.macworld.com/deals/feed", homepage: "https://www.macworld.com/deals", trust: 12, maxItems: 12 },
  { name: "PCWorld Deals", url: "https://www.pcworld.com/deals/feed", homepage: "https://www.pcworld.com/deals", trust: 12, maxItems: 12 },
  { name: "TechHive Deals", url: "https://www.techhive.com/deals/feed", homepage: "https://www.techhive.com/deals", trust: 12, maxItems: 12 },
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
    .replace(/&nbsp;/g, " ")
    .replace(/&times;/g, "×")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)));
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
    if (url && !/pixel|tracking|spacer|logo|avatar|icon/i.test(url)) {
      const improved = new URL(url);
      if (improved.hostname === "d.dlnws.com") {
        improved.searchParams.set("w", "900");
        improved.searchParams.delete("h");
      }
      return improved.toString();
    }
  }
  return null;
}

function extractPrices(title: string, description: string) {
  const text = `${title} ${description.slice(0, 400)}`;
  const percent = [...text.matchAll(/(?:save\s+|up to\s+|\b)(\d{1,2})%\s*off/gi)]
    .map((match) => Number(match[1]))
    .find((value) => value >= 5 && value <= 95);
  const isCurrentPrice = (match: RegExpMatchArray, sourceText: string) => {
    const start = match.index ?? 0;
    const before = sourceText.slice(Math.max(0, start - 24), start);
    const after = sourceText.slice(start + match[0].length, start + match[0].length + 24);
    if (/\b(?:off|save|saves|saved|saving|savings|shed|sheds|cut|cuts|credit|worth|rebate)(?:\s+(?:up to|over|nearly|about))?\s*$/i.test(before)) return false;
    if (/\b(?:discounted|reduced)\s+by(?:\s+(?:over|up to))?\s*$/i.test(before)) return false;
    if (/\bshipping\s+(?:on|over|from)\s*$/i.test(before)) return false;
    if (/^\s*(?:off|discount|coupon|credit|savings?|rebate|reduction|value|knocked|cheaper)/i.test(after)) return false;
    if (/^\s*(?:each|ea\.?\b|per\b)/i.test(after)) return false;
    if (/^\s*\+(?!\s*free)/i.test(after)) return false;
    return true;
  };
  const titleMatches = [...title.matchAll(/\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/g)].filter((match) => isCurrentPrice(match, title));
  const strongTitleMatches = [...title.matchAll(/(?:for|at|now|only|from|starting at|starting from|drops? to|down to|down at|to just|=)\s*[*_]*\s*(\$\s?([0-9][0-9,]*(?:\.\d{1,2})?))/gi)]
    .filter((match) => {
      const synthetic = [match[1], match[2]] as unknown as RegExpMatchArray;
      synthetic.index = (match.index ?? 0) + match[0].indexOf(match[1]);
      return isCurrentPrice(synthetic, title);
    });
  const contextualMatches = [...text.matchAll(/(?:for|at|now|only|from|starting at|starting from|drops? to|down to|down at|to just|=)\s*[*_]*\s*(\$\s?([0-9][0-9,]*(?:\.\d{1,2})?))/gi)]
    .filter((match) => {
      const synthetic = [match[1], match[2]] as unknown as RegExpMatchArray;
      synthetic.index = (match.index ?? 0) + match[0].indexOf(match[1]);
      return isCurrentPrice(synthetic, text);
    });
  const strongTitlePrice = strongTitleMatches.at(-1)?.[2];
  const titlePrice = titleMatches.at(-1)?.[1];
  const contextualPrice = contextualMatches.at(-1)?.[2];
  const finalEqualsPrice = [...text.matchAll(/=\s*[*_]*\s*\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/g)].at(-1)?.[1];
  const contextualTitleMatch = contextualMatches.map((match) => match[2]).find((value) => titleMatches.some((titleMatch) => titleMatch[1] === value));
  const parsedPrice = finalEqualsPrice ?? strongTitlePrice ?? contextualTitleMatch ?? titlePrice ?? contextualPrice;
  const price = parsedPrice ? Number(parsedPrice.replace(/,/g, "")) : null;
  const explicitOriginal = [
    /(?:was|regularly|reg\.?|list price|normally)\s*\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/i,
    /(?:on sale )?for\s*\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)\s*[-–]\s*(?:\$|\d+%)/i,
  ]
    .map((pattern) => text.match(pattern)?.[1])
    .find(Boolean);
  const titleValues = titleMatches.map((match) => Number(match[1].replace(/,/g, "")));
  const titleOriginal = titleValues.length >= 2 && titleValues[0] > (price ?? 0) * 1.08 ? titleValues[0] : null;
  const parsedOriginal = explicitOriginal ? Number(explicitOriginal.replace(/,/g, "")) : null;
  const originalPrice = price !== null && parsedOriginal && parsedOriginal > price * 1.08 ? parsedOriginal : titleOriginal;
  const discountPercent = percent ?? (price && originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null);
  return { price, originalPrice, discountPercent };
}

async function imageIsUsable(imageUrl: string) {
  try {
    const response = await fetch(imageUrl, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*", Range: "bytes=0-2047", "User-Agent": "Mozilla/5.0 DealoraImageCheck/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    await response.body?.cancel();
    return response.ok && contentType.toLowerCase().startsWith("image/");
  } catch {
    return false;
  }
}

async function keepDealsWithUsableImages(deals: Deal[]) {
  const verified: Deal[] = [];
  for (let index = 0; index < deals.length; index += 12) {
    const batch = deals.slice(index, index + 12);
    const checks = await Promise.all(batch.map((deal) => imageIsUsable(deal.imageUrl!)));
    batch.forEach((deal, dealIndex) => { if (checks[dealIndex]) verified.push(deal); });
  }
  return verified;
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
  const imageUrl = extractImage(item, `${content} ${descriptionHtml}`, source.homepage);
  if (!isSpecificProductDeal({ title, price, imageUrl })) return null;
  const score = scoreDeal(title, summary, publishedAt, source.trust, discountPercent);
  const allText = `${title} ${summary}`;
  return {
    id: fingerprint(`${source.name}:${asText(item.guid) || url}`), title,
    summary: summary || "A fresh offer worth a closer look. Check the source for current pricing and availability.",
    url, imageUrl, source: source.name,
    sourceUrl: source.homepage, merchant: merchantFor(allText, source.name), category: categoryFor(allText),
    price, originalPrice, discountPercent, publishedAt, score, badge: badgeFor(score, discountPercent, publishedAt),
    corroborationCount: 1, alsoFoundAt: [{ source: source.name, url }],
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

const PRODUCT_STOP_WORDS = new Set([
  "a", "an", "and", "at", "for", "from", "in", "is", "of", "on", "or", "the", "to", "via", "with",
  "deal", "deals", "sale", "save", "off", "free", "shipping", "prime", "new", "just", "lowest", "price",
  "amazon", "ebay", "walmart", "target", "best", "buy", "today", "now", "drops", "dropped",
]);

function productTokens(title: string) {
  return new Set(
    title.toLowerCase()
      .replace(/\$\s?[0-9,.]+|\b\d{1,2}%\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((token) => token.length > 1 && !PRODUCT_STOP_WORDS.has(token)),
  );
}

function productSimilarity(first: Deal, second: Deal) {
  const a = productTokens(first.title);
  const b = productTokens(second.title);
  const shared = [...a].filter((token) => b.has(token)).length;
  if (shared < 3) return 0;
  const union = new Set([...a, ...b]).size;
  const jaccard = shared / Math.max(1, union);
  const smallerCoverage = shared / Math.max(1, Math.min(a.size, b.size));
  const priceRatio = Math.max(first.price!, second.price!) / Math.max(0.01, Math.min(first.price!, second.price!));
  if (priceRatio > 1.35) return 0;
  return jaccard * 0.55 + smallerCoverage * 0.45;
}

function clusterAndRank(deals: Deal[]) {
  const clusters: Deal[] = [];
  const sorted = [...deals].sort((a, b) => b.score - a.score || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  for (const deal of sorted) {
    const match = clusters.find((candidate) => productSimilarity(candidate, deal) >= 0.78);
    if (!match) {
      clusters.push({ ...deal, corroborationCount: 1, alsoFoundAt: [{ source: deal.source, url: deal.url }] });
      continue;
    }

    const previousBonus = Math.min(9, (match.corroborationCount - 1) * 3);
    if (!match.alsoFoundAt.some((item) => item.source === deal.source)) {
      match.alsoFoundAt.push({ source: deal.source, url: deal.url });
    }
    match.corroborationCount = match.alsoFoundAt.length;
    const corroborationBonus = Math.min(9, (match.corroborationCount - 1) * 3);
    match.score = Math.min(99, Math.max(match.score - previousBonus, deal.score) + corroborationBonus);
    match.badge = badgeFor(match.score, match.discountPercent, match.publishedAt);
  }

  return clusters.sort((a, b) => b.score - a.score || b.corroborationCount - a.corroborationCount || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function diversifySources(deals: Deal[], limit: number) {
  const contributingSources = new Set(deals.map((deal) => deal.source)).size;
  const softCap = Math.max(5, Math.ceil((limit / Math.max(1, contributingSources)) * 1.8));
  const selected: Deal[] = [];
  const deferred: Deal[] = [];
  const sourceCounts = new Map<string, number>();

  for (const deal of deals) {
    const count = sourceCounts.get(deal.source) ?? 0;
    if (count < softCap && selected.length < limit) {
      selected.push(deal);
      sourceCounts.set(deal.source, count + 1);
    } else {
      deferred.push(deal);
    }
  }
  for (const deal of deferred) {
    if (selected.length >= limit) break;
    selected.push(deal);
  }
  return selected.sort((a, b) => b.score - a.score || b.corroborationCount - a.corroborationCount);
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
  const rawCandidates = [...freshDeals, ...recentPrevious].filter((deal) => isSpecificProductDeal(deal));
  const imageVerified = await keepDealsWithUsableImages(rawCandidates);
  const clustered = clusterAndRank(imageVerified);
  const deals = diversifySources(clustered, 120);
  console.log(`✓ Product and image gate: ${imageVerified.length}/${rawCandidates.length} verified`);
  console.log(`✓ Intelligence pass: merged ${imageVerified.length - clustered.length} duplicates into ${clustered.length} product clusters`);
  if (deals.length < 12) throw new Error(`Only ${deals.length} deals were collected; refusing to overwrite a healthy dataset.`);
  const dataset: DealDataset = {
    generatedAt: new Date().toISOString(), sourceCount: sourceHealth.filter((source) => source.status === "ok").length,
    itemCount: deals.length, deals, sourceHealth,
    intelligence: {
      rawProductCandidates: rawCandidates.length,
      imageVerifiedCandidates: imageVerified.length,
      duplicateClustersMerged: imageVerified.length - clustered.length,
      contributingSources: new Set(deals.flatMap((deal) => deal.alsoFoundAt.map((item) => item.source))).size,
    },
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Saved ${deals.length} ranked deals from ${dataset.sourceCount} live sources.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
