"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ProductGallery, PriceDisplay, AddToCartButton, StockBadge } from "@/components/shop";
import { VariationSelector } from "@/components/shop/variation-selector";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Prose } from "@/components/craft";
import type { Product, ProductVariation, ProductImage, ProductReview } from "@/lib/woocommerce.d";
import { EarnPoints } from "./earn-points";
import { DeliveryInfo } from "./delivery-info";
import { PincodeChecker } from "./pincode-checker";
import { StarRating } from "./star-rating";
import { cn } from "@/lib/utils";
import { EMIOptions } from "./emi-options";

interface ProductViewProps {
  product: Product;
  variations: ProductVariation[];
  reviews: ProductReview[]; // Add this to the interface
}

export function ProductView({ product, variations, reviews }: ProductViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 1. Define the default/initial variation first (logic: find in-stock, else first one)
  const initialVariation = useMemo(() => {
    if (!variations || variations.length === 0) return null;
    return variations.find(v => v.stock_status === 'instock') || variations[0];
  }, [variations]);

  // 2. Initialize state with that variation
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(initialVariation);

  // Sync Gallery Images: Puts variation image first
  const displayImages = useMemo(() => {
    if (selectedVariation?.image?.src) {
      const existingImg = product.images.find(img => img.src === selectedVariation.image?.src);
      const varImg: ProductImage = existingImg ? existingImg : {
        ...product.images[0],
        id: selectedVariation.image.id,
        src: selectedVariation.image.src,
        alt: selectedVariation.image.alt || product.name,
      };
      const filteredBase = product.images.filter((img) => img.src !== varImg.src);
      return [varImg, ...filteredBase];
    }
    return product.images;
  }, [selectedVariation, product.images, product.name]);

  const brand = product.brands?.[0];

  return (
    <div className="space-y-16"> {/* Wrapper for the whole page content */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* 1. Gallery */}
        <ProductGallery 
          key={selectedVariation?.id || "base"} 
          images={displayImages} 
          productName={product.name} 
        />

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            
            {/* Brand Link */}
            {brand && (
              <Link 
                href={`/shop?brand=${brand.slug}`}
                className="inline-block text-sm font-semibold text-blue-700 underline uppercase tracking-widest"
              >
                Visit the {brand.name} store
              </Link>
            )}
          </div>

          {/* Star Rating Summary */}
<div className="flex items-center gap-3 mt-2">
  <StarRating 
    rating={product.average_rating} 
    className="m-0" 
  />
  <Link 
    href="#reviews" 
    className="text-sm font-semibold text-blue-700 hover:underline transition-colors"
    onClick={(e) => {
      // Optional: If you want a smooth scroll effect
      e.preventDefault();
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    }}
  >
    ({reviews.length}) {reviews.length === 1 ? 'Review' : 'Reviews'}
  </Link>
</div>


          <div>
  <PriceDisplay
    // Use selectedVariation if user clicked, otherwise fall back to the initialVariation
    price={selectedVariation?.price || initialVariation?.price || product.price}
    regularPrice={selectedVariation?.regular_price || initialVariation?.regular_price || product.regular_price}
    salePrice={selectedVariation?.sale_price || initialVariation?.sale_price || product.sale_price}
    // Correctly detect if the current selection (or initial auto-selection) is on sale
    onSale={selectedVariation ? selectedVariation.on_sale : (initialVariation?.on_sale || product.on_sale)}
    size="md"
  /> 
  <span className="text-sm text-muted-foreground ml-2">(Incl. of all taxes)</span>
</div>

          <EMIOptions price={selectedVariation?.price || product.price} />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <EarnPoints 
              price={selectedVariation?.price || product.price} 
              earnRate={0.01} // Shows 1 point for every ₹100 in price
              redemptionValue={1}  
            />
            </div>
            <div>
              <PincodeChecker />
            </div>
          </div>        

          <div className="grid md:grid-cols-2 gap-4">
            <StockBadge product={selectedVariation || product} showQuantity />
            <div className="space-y-2">              
              <DeliveryInfo 
                price={selectedVariation?.price || product.price} 
                freeShippingThreshold={499} 
              />
            </div>
          </div>  
            
          <Separator />

          {/* Variation Selector */}
          {product.type === "variable" && (
            <VariationSelector 
              product={product}
              variations={variations} 
              onVariationChange={(v) => setSelectedVariation(v)} 
            />
          )}

          <div className="pt-4">
            <AddToCartButton 
              product={product} 
              variation={selectedVariation} 
            />
          </div>

          <Separator />
          
          {product.short_description && (
  <div className="space-y-4">
    <Prose className="max-w-none">
      <div 
        className={cn(
          "text-[14px] leading-relaxed text-muted-foreground transition-all",
          "product_short-description prose-sm prose-slate",
          !isExpanded && "line-clamp-3"
        )}
        dangerouslySetInnerHTML={{ __html: product.short_description }} 
      />
    </Prose>
    
    <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:underline mt-1"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
  </div>
)}


          {/* Product Meta */}
          <div className="space-y-3 text-sm pt-2">
            {(selectedVariation?.sku || product.sku) && (
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">SKU:</span>
                <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                  {selectedVariation?.sku || product.sku}
                </span>
              </p>
            )}
            
            {product.tags.length > 0 && (
              <p>
                <span className="text-muted-foreground font-medium">Tags:</span>{" "}
                {product.tags.map((tag, i) => (
                  <span key={tag.id}>
                    <Link href={`/shop?tag=${tag.slug}`} className="hover:underline">{tag.name}</Link>
                    {i < product.tags.length - 1 && ", "}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
