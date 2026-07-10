import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/woocommerce";

// Add IDs of brands you want to hide here.
// Example: /shop?product_brand=67
const HIDDEN_BRAND_IDS: string[] = ["68","66","67","65", "73", "854", "855","1383","1407","930","830","1438","779","69"];

export default async function BrandList() {
  const allBrands = await getBrands();

  // Keep all brands except the hidden ones.
  // Brand image is now optional.
  const visibleBrands = (allBrands || []).filter((brand) => {
    return !HIDDEN_BRAND_IDS.includes(String(brand.id));
  });

  if (visibleBrands.length === 0) {
    return (
      <div className="border-y bg-slate-50 py-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          No brands found in product_brand taxonomy
        </p>
      </div>
    );
  }

  return (
    <>
      <h3 className="mb-8 text-center text-3xl font-bold text-blue-950">
        Our Top <span className="text-red-700">Brands</span>
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {visibleBrands.map((brand) => {
          const hasImage = Boolean(brand.image?.src);

          return (
            <Link
              key={brand.id}
              href={`/shop?product_brand=${brand.id}`}
              className="group flex min-h-[100px] items-center justify-center rounded-xl border bg-white p-6 text-center transition-all hover:shadow-md"
            >
              {hasImage ? (
                <Image
                  src={brand.image.src}
                  alt={brand.name}
                  width={120}
                  height={70}
                  className="max-h-12.5 w-auto object-contain transition-all"
                />
              ) : (
                <span className="text-sm font-semibold text-blue-950 transition-colors group-hover:text-red-700">
                  {brand.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}