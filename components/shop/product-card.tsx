import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/woocommerce.d";
import { cn } from "@/lib/utils";
import { formatPrice, calculateDiscountPercentage, isProductInStock } from "@/lib/woocommerce";
import { Badge } from "@/components/ui/badge";
import CompareButton from "@/components/shop/compare-button"; // [NEW IMPORT]
import { WishlistToggle } from "./wishlist-button";


interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const inStock = isProductInStock(product);
  
  const regularPrice = product.regular_price || product.price;
  const salePrice = product.sale_price;
  const hasSale = product.on_sale && salePrice && salePrice !== regularPrice;

  const discountPercentage = hasSale
    ? calculateDiscountPercentage(regularPrice, salePrice)
    : 0;

  const primaryImage = product.images[0];

  return (
    <div className="relative group flex flex-col border rounded-xl overflow-hidden bg-white hover:bg-white transition-all">
      
      {/* Compare Button - Now hidden until hover for a cleaner look */}
<div className="absolute top-2 right-2 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <WishlistToggle productId={product.id} />
  <CompareButton productId={product.id} />
</div>


      <Link href={`/shop/${product.slug}`} className="flex flex-col flex-1">
        <div className="relative aspect-square overflow-hidden">
          {primaryImage?.src ? (
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105 p-5"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-accent/50">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasSale && discountPercentage > 0 && (
              <Badge variant="destructive" className="font-bold">
                -{discountPercentage}% OFF
              </Badge>
            )}
            {product.featured && <Badge variant="secondary">Featured</Badge>}
            {!inStock && <Badge variant="outline" className="bg-background/80">Out of Stock</Badge>}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 flex-1">
          {product.categories[0] && (
            <span 
              className="text-xs text-muted-foreground" 
              dangerouslySetInnerHTML={{ __html: product.categories[0].name }}
            />
          )}

          <h3 className="font-medium line-clamp-2 group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mt-auto">
            {hasSale ? (
              <>
                <span className="font-bold text-lg text-red-700">
                  {formatPrice(salePrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                  {formatPrice(regularPrice)}
                </span>
              </>
            ) : (
              <span className="font-bold text-lg text-foreground">
                {product.price ? formatPrice(product.price) : "Price on request"}
              </span>
            )}
          </div>

          {product.rating_count > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-yellow-500">★</span>
              <span className="font-medium text-foreground">{product.average_rating}</span>
              <span>({product.rating_count})</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
