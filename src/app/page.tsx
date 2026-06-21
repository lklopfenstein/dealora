import datasetJson from "@/data/deals.json";
import { DealExplorer } from "@/components/deal-explorer";
import type { DealDataset } from "@/types/deal";

const dataset = datasetJson as DealDataset;

export default function Home() {
  return <DealExplorer dataset={dataset} />;
}
