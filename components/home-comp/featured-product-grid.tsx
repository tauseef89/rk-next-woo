// components/home-comp/featured-product-grid.tsx
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { getProducts } from "@/lib/woocommerce";

export default async function FeaturedProductGrid() {
  // Fetching featured products
  const { data: products } = await getProducts(1, 7, { featured: true });

  if (!products || products.length === 0) return null;

  const calculateDiscount = (regular: string, sale: string) => {
    const reg = parseFloat(regular);
    const cur = parseFloat(sale);
    if (!reg || cur >= reg) return null;
    return Math.round(((reg - cur) / reg) * 100);
  };

  const formatCurrency = (price: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between px-2 md:px-0">
        <h3 className="text-3xl font-bold text-blue-950">
          Steal The <span className="text-red-700">Deal</span>
        </h3>
        <Link href="/shop" className="text-sm font-medium hover:underline text-blue-950">
          Browse All Products <span className="text-red-700">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-2 gap-4">
        {products.map((product: any, index: number) => {
          const isFeatured = index === 0;
          const productLink = `/shop/${product.slug}`;
          const discount = calculateDiscount(product.regular_price, product.price);
          const rating = Math.round(parseFloat(product.average_rating || "0"));

          return (
            <div
              key={product.id}
              className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-500 ${
                isFeatured 
                  ? "md:col-span-2 md:row-span-2 flex flex-col" 
                  : "md:col-span-1 border hover:border-red-700"
              }`}
            >
              {/* Image Section */}
              <div className={`relative w-full overflow-hidden bg-white ${isFeatured ? "flex-1 min-h-80" : "aspect-square"}`}>
                {discount && (
                  <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    -{discount}% OFF
                  </div>
                )}
                
                {product.images?.[0]?.src && (
                  <Image 
                    src={product.images[0].src} 
                    alt={product.name} 
                    fill 
                    className="object-contain transition-transform duration-500 group-hover:scale-110 p-6" 
                  />
                )}
                
                {/* Hover Icons (Small Products Only) */}
                {!isFeatured && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">                    
                    <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-700 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-[0ms]">
                      <Heart size={16} />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-700 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-50">
                      <ShoppingCart size={16} />
                    </button>
                    <Link 
                      href={productLink} 
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-700 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-100"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className={`flex flex-col ${isFeatured ? "p-8 md:p-10 bg-zinc-50" : "p-4"}`}>
                {/* Product Title with Link and Hover Underline */}
                <h4 className={`font-bold text-zinc-900 transition-colors ${
                  isFeatured 
                    ? "text-3xl mb-3 group-hover:text-red-700 group-hover:underline underline-offset-4" 
                    : "text-sm truncate mb-2 group-hover:underline underline-offset-2"
                }`}>
                  <Link href={productLink}>
                    {product.name}
                  </Link>
                </h4>

                {isFeatured && (
                  <>
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}`} 
                        />
                      ))}
                      <span className="text-sm text-zinc-500 ml-2">({product.rating_count || 0} reviews)</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl font-black text-red-700">
                        {formatCurrency(product.price)}
                      </span>
                      {discount && (
                        <span className="text-xl text-zinc-400 line-through decoration-zinc-400/50">
                          {formatCurrency(product.regular_price)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div 
                      className="mb-8 line-clamp-3 text-base text-zinc-600 leading-relaxed italic" 
                      dangerouslySetInnerHTML={{ __html: product.short_description }} 
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      <button className="p-4 border border-zinc-300 rounded-lg hover:bg-white hover:border-red-700 hover:text-red-700 transition-all shadow-sm">
                        <Heart size={24} />
                      </button>
                      <button className="flex-1 bg-red-700 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all shadow-lg active:scale-95">
                        <ShoppingCart size={24} /> ADD TO CART
                      </button>
                    </div>
                  </>
                )}

                {!isFeatured && (
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-bold text-red-700">
                      {formatCurrency(product.price)}
                    </span>
                    {discount && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatCurrency(product.regular_price)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
