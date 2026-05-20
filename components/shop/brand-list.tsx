import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/woocommerce";

export default async function BrandList() {
  const brands = await getBrands();

  if (!brands || brands.length === 0) {
    return (
      <div className="py-10 text-center border-y bg-slate-50">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
          No brands found in 'product_brand' taxonomy
        </p>
      </div>
    );
  }

  return (
    <>
    <h3 className="text-3xl font-bold text-blue-950 mb-8 text-center">Our Top <span className="text-red-700">Brands</span></h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="group border rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-all bg-white min-h-25"
            >
              {/* Note: Some plugins store the image in brand.image, others in brand.acf.logo */}
              {brand.image?.src ? (
                <Image
                  src={brand.image.src}
                  alt={brand.name}
                  width={120}
                  height={70}
                  className="object-contain transition-all max-h-12.5 w-auto"
                />
              ) : (
                <span className="font-bold text-slate-400 group-hover:text-primary text-sm uppercase">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
    </>
  );
}
