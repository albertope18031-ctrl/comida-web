import { NextResponse } from "next/server";
import { PRODUCTS, FLAVORS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      products: PRODUCTS,
      flavors: FLAVORS,
      timestamp: Date.now(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, max-age=86400",
      },
    }
  );
}
