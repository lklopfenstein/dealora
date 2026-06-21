export type ProductDealCandidate = {
  title: string;
  price: number | null;
  imageUrl: string | null;
};

export const GENERIC_DEAL_PATTERNS = [
  /\b(?:weekly|roundup|gift guide)\b/i,
  /\b(?:sitewide|storewide)\b/i,
  /\b(?:sale|deals?)\s+(?:at|offers|with|for up to)\b/i,
  /\bsale\s+for\s+(?:from\s+)?\$/i,
  /^(?:amazon|walmart|target|adidas|nike|home depot|lowe'?s)\b.*\b(?:sale|deals?|coupons?)\b/i,
  /\b(?:lightning|coupon|electronics|snack|candy|drinks|fashion)\s+deals?\b/i,
  /\bup to\s+\d{1,2}%\s*off\b/i,
  /\b(?:select|various)\s+(?:items|products|styles|deals)\b/i,
  /\bdeals? from \$\d+/i,
  /\bbest\b.*\bdeals?\b/i,
  /\b\d+\s+deals?\b/i,
  /\b(?:gift cards?|subscriptions?)\b/i,
  /\b(?:bundle|bundled) savings\b/i,
  /\bcredit\b.*\breserv(?:e|ation)\b/i,
  /\b(?:and )?more\s*$/i,
] as const;

export function isSpecificProductDeal({ title, price, imageUrl }: ProductDealCandidate) {
  if (!imageUrl || price === null || price <= 0) return false;
  return !GENERIC_DEAL_PATTERNS.some((pattern) => pattern.test(title));
}
