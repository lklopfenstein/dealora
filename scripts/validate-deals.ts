import datasetJson from "../src/data/deals.json";
import { isSpecificProductDeal } from "../src/lib/deal-quality";
import type { DealDataset } from "../src/types/deal";

const dataset = datasetJson as DealDataset;
const failures: string[] = [];
const ids = new Set<string>();

for (const deal of dataset.deals) {
  if (!isSpecificProductDeal(deal)) failures.push(`${deal.id}: not a specific, priced product with an image (${deal.title})`);
  if (ids.has(deal.id)) failures.push(`${deal.id}: duplicate ID`);
  ids.add(deal.id);
  try {
    const image = new URL(deal.imageUrl!);
    if (!/^https?:$/.test(image.protocol)) failures.push(`${deal.id}: unsafe image protocol`);
  } catch {
    failures.push(`${deal.id}: invalid image URL`);
  }
}

if (dataset.itemCount !== dataset.deals.length) failures.push(`itemCount is ${dataset.itemCount}, but data contains ${dataset.deals.length} deals`);
if (dataset.deals.length < 12) failures.push(`catalog is too small: ${dataset.deals.length} deals`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${dataset.deals.length} specific products with prices and verified image URLs.`);
}
