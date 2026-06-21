# Dealora monetization plan

The governing idea is simple: **monetize the shopping outcome, not the reader's attention**. Dealora should remain calm, fast, and useful even if every revenue integration is turned off.

## Recommended revenue stack

### 1. Automatic commerce affiliation — launch first

Apply to one commerce network, then activate its single site-wide integration:

- **Sovrn Commerce** is the preferred first application. Its JavaScript automatically converts eligible plain merchant links, loads asynchronously, and supports yield optimization across approved programs. Dealora already supports it with `NEXT_PUBLIC_COMMERCE_PROVIDER=sovrn` and `NEXT_PUBLIC_SOVRN_COMMERCE_KEY`.
- **Skimlinks** is the fallback or comparison candidate. It automates eligible-link conversion across many affiliate networks and consolidates payments. Dealora supports the exact install-script URL through `NEXT_PUBLIC_COMMERCE_PROVIDER=skimlinks` and `NEXT_PUBLIC_SKIMLINKS_SCRIPT_URL`.

Use only one automatic link-conversion provider at a time. Both require a one-time publisher application and payout/tax setup. After that, link conversion and reporting are automatic.

Official references:

- [Sovrn Commerce](https://www.sovrn.com/commerce/)
- [Sovrn JavaScript implementation](https://knowledge.sovrn.com/kb/javascript-for-commerce)
- [Skimlinks publisher setup](https://support.skimlinks.com/hc/en-us/articles/36714399781789-How-Skimlinks-simplifies-affiliate-marketing-for-Content-Creators)
- [Skimlinks installation](https://support.skimlinks.com/hc/en-us/articles/360024714273-How-do-I-install-Skimlinks)

Important: automatic link affiliation only earns on approved, eligible merchant links. Links to editorial source articles will usually not produce commission.

### 2. Approved commerce inventory — highest-leverage next step

Once a network account is approved, add its product/deal feed or API as a first-class ingestion adapter. This gives Dealora direct, commissionable retailer inventory while preserving the independent source links used for verification.

Prioritize:

1. Sovrn Commerce APIs for merchant choice, stock, pricing, and yield optimization.
2. eBay Partner Network feeds/APIs for commissionable daily deals.
3. Direct retailer programs only when their payout materially beats the aggregator network and can be handled automatically.

This is the piece that makes revenue genuinely hands-off: the daily workflow imports offers, checks availability, chooses an eligible merchant, and publishes the tracked destination without manual link building.

### 3. Automatic comparison rows — better UX and better economics

For matching products, show a compact "Also at" row with the best two or three in-stock retailers. The cheapest option remains first. If prices tie, estimated reliability and then commission rate can be tie-breakers.

This increases user trust and conversion while diversifying revenue across retailers. Sovrn advertises automated price comparisons, alternative-merchant discovery, and stock updates, so this should be evaluated before building a custom comparison backend.

### 4. One native sponsored-deal slot — only after traffic exists

At meaningful scale, permit one clearly labeled sponsored card after every 12 organic deals. It must:

- satisfy the same quality and freshness floor as organic deals;
- never displace the top organic result;
- match the card design without disguising the "Sponsored" label;
- be filled by a programmatic or network feed, not manually sold campaigns.

No popups, interstitials, autoplay, sticky takeover ads, or Google Auto Ads. Those monetize page furniture rather than purchase intent and weaken the product.

### 5. Optional daily email — later

An opt-in daily digest can reuse the existing JSON dataset and send the top five deals automatically. Affiliate links carry over, and a single newsletter sponsor can be programmatically inserted when the list is large enough. This creates repeat traffic, but should wait until deliverability, unsubscribe handling, and a privacy-safe provider are selected.

## Ranking guardrails

Revenue must never be the primary rank signal. A sensible future formula is:

- 85% shopper value: freshness, real discount, price clarity, availability, source trust.
- 10% conversion confidence: retailer reliability and historical click-to-sale performance.
- 5% yield tie-breaker: expected commission, used only among similarly good offers.

Any paid placement remains outside the organic score and is labeled.

## Illustrative economics

Revenue is driven by intent, not raw pageviews:

`monthly sessions × outbound click rate × purchase conversion × average order value × commission rate`

For illustration only, 100,000 monthly sessions × 25% outbound clicks × 4% purchases × $80 average order × 3% commission is about **$2,400/month**. Actual results vary sharply by category, attribution window, geography, returns, and program terms.

## Compliance and trust

- Keep the commission disclosure close to deal links. The FTC says affiliate relationships should be clear and conspicuous, and that "affiliate link" alone may not be understood.
- Keep `rel="nofollow"` on commercial outbound links.
- Do not create thousands of thin, auto-generated SEO pages. Google's spam policy specifically warns against scaled content assembled from feeds without added value.
- Update the privacy page with the selected provider's legal name and privacy link before activation.

Official references:

- [FTC endorsement and affiliate disclosure guidance](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [eBay Partner Network](https://partnernetwork.ebay.com/)
- [eBay rate card](https://partnernetwork.ebay.com/our-program/rate-card)
