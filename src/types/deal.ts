export const CATEGORIES = [
  "All",
  "Tech",
  "Home",
  "Style",
  "Gaming",
  "Everyday",
  "Travel",
] as const;

export type Category = Exclude<(typeof CATEGORIES)[number], "All">;

export type Deal = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  merchant: string;
  category: Category;
  price: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  publishedAt: string;
  score: number;
  badge: "Editor's pick" | "Price drop" | "Fresh find" | "Worth a look";
};

export type DealDataset = {
  generatedAt: string;
  sourceCount: number;
  itemCount: number;
  deals: Deal[];
  sourceHealth: Array<{
    name: string;
    status: "ok" | "error";
    itemCount: number;
  }>;
};
