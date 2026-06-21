import { NextResponse } from "next/server";
import dataset from "@/data/deals.json";

export function GET() {
  return NextResponse.json(dataset, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
