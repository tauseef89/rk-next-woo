import { getProductsByIds } from "@/lib/woocommerce";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").map(Number) || [];
  
  const products = await getProductsByIds(ids);
  return NextResponse.json(products);
}
