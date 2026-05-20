import { NextResponse } from "next/server";
import { getAllProductCategories, getAllAttributes, getAttributeTerms } from "@/lib/woocommerce";

export async function GET() {
  try {
    // 1. Fetch categories and base attributes in parallel
    const [categories, attributes] = await Promise.all([
      getAllProductCategories(),
      getAllAttributes(),
    ]);

    // 2. Fetch all terms for all attributes in parallel
    const sidebarAttributes = await Promise.all(
      attributes.map(async (attr: any) => {
        const terms = await getAttributeTerms(attr.id);
        return {
          id: attr.slug, 
          label: attr.name,
          options: terms.map((t: any) => ({
            label: t.name,
            value: t.slug,
          })),
        };
      })
    );

    return NextResponse.json({
      categories,
      attributes: sidebarAttributes
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
