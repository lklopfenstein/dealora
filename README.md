# Dealora

**Great prices, minus the scavenger hunt.**

Dealora is a polished, zero-cost daily deal aggregator. It gathers public deal feeds, normalizes the offers into one clean dataset, removes near-duplicates, ranks the strongest finds, and publishes them in a fast Next.js storefront.

## What it does

- Imports public feeds from eight established deal and product publications.
- Extracts price, original price, discount, merchant, image, category, and freshness.
- Scores each offer using recency, savings, source quality, price specificity, and deal language.
- Deduplicates overlapping offers across sources.
- Offers fast client-side search, categories, sorting, and browser-local bookmarks.
- Clearly attributes and links every deal to its original source.
- Refreshes automatically every morning with GitHub Actions.

## Free architecture

- **Hosting:** Vercel Hobby
- **Code and automation:** GitHub + GitHub Actions
- **Data:** versioned JSON in the repository
- **Database:** none
- **Paid APIs:** none

The scheduled workflow runs at 10:17 UTC each day. A changed dataset is committed to `main`; Vercel then builds the fresh static experience automatically.

## Local development

```bash
npm install
npm run ingest
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Add or remove sources

Edit the `SOURCES` array in `scripts/ingest-deals.ts`. Sources must expose a public RSS or Atom feed and should link back to the original post. The importer accepts common RSS, Atom, media, enclosure, and HTML-image fields.

## Automatic monetization

Dealora includes dormant, environment-controlled integrations for Sovrn Commerce and Skimlinks. No tracking script loads unless a provider and valid credential are configured. See [the monetization plan](docs/MONETIZATION.md) and `.env.example` for the recommended rollout and activation variables.

## Important notes

Dealora is an index, not a retailer. Prices and availability can change, and visitors should confirm the final details at the linked source or merchant. Source content is reduced to short factual excerpts, with attribution and outbound links preserved.
