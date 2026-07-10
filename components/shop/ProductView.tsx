"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ProductGallery,
  PriceDisplay,
  AddToCartButton,
  StockBadge,
} from "@/components/shop";
import { VariationSelector } from "@/components/shop/variation-selector";
import { Separator } from "@/components/ui/separator";
import { Prose } from "@/components/craft";
import type {
  Product,
  ProductVariation,
  ProductImage,
  ProductReview,
} from "@/lib/woocommerce.d";
import { EarnPoints } from "./earn-points";
import { DeliveryInfo } from "./delivery-info";
import { PincodeChecker } from "./pincode-checker";
import { StarRating } from "./star-rating";
import { cn } from "@/lib/utils";
import { EMIOptions } from "./emi-options";

import {
  ApplianceExchangeProduct,
  AppliedApplianceExchange,
  getExchangeCategoryFromProduct,
} from "@/components/shop/appliance-exchange-product";

import {
  ExtendedWarranty,
  AppliedExtendedWarranty,
  getWarrantyCategoryFromProduct,
} from "@/components/shop/extended-warranty";

interface ProductViewProps {
  product: Product;
  variations: ProductVariation[];
  reviews: ProductReview[];
}

export function ProductView({
  product,
  variations,
  reviews,
}: ProductViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [exchange, setExchange] = useState<AppliedApplianceExchange | null>(
    null
  );

  const [extendedWarranty, setExtendedWarranty] =
    useState<AppliedExtendedWarranty | null>(null);

  // Detect exchange-compatible category.
  const exchangeCategory = getExchangeCategoryFromProduct(product);

  // Detect warranty category from product name and WooCommerce categories.
  const warrantyCategory = getWarrantyCategoryFromProduct(product);

  const initialVariation = useMemo(() => {
    if (!variations || variations.length === 0) return null;

    return (
      variations.find((variation) => variation.stock_status === "instock") ||
      variations[0]
    );
  }, [variations]);

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(initialVariation);

  const currentPrice =
    selectedVariation?.price || initialVariation?.price || product.price;

  const currentRegularPrice =
    selectedVariation?.regular_price ||
    initialVariation?.regular_price ||
    product.regular_price;

  const currentSalePrice =
    selectedVariation?.sale_price ||
    initialVariation?.sale_price ||
    product.sale_price;

  const currentOnSale = selectedVariation
    ? selectedVariation.on_sale
    : initialVariation?.on_sale || product.on_sale;

  const displayImages = useMemo(() => {
    if (selectedVariation?.image?.src) {
      const existingImage = product.images.find(
        (image) => image.src === selectedVariation.image?.src
      );

      const variationImage: ProductImage = existingImage
        ? existingImage
        : {
            ...product.images[0],
            id: selectedVariation.image.id,
            src: selectedVariation.image.src,
            alt: selectedVariation.image.alt || product.name,
          };

      const remainingImages = product.images.filter(
        (image) => image.src !== variationImage.src
      );

      return [variationImage, ...remainingImages];
    }

    return product.images;
  }, [selectedVariation, product.images, product.name]);

  const brand = product.brands?.[0];

  return (
    <div className="space-y-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery
          key={selectedVariation?.id || "base"}
          images={displayImages}
          productName={product.name}
        />

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {product.name}
            </h1>

            {brand && (
              <Link
                href={`/shop?product_brand=${brand.id}`}
                className="inline-block text-sm font-semibold uppercase tracking-widest text-blue-700 underline"
              >
                Visit the {brand.name} store
              </Link>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.average_rating} className="m-0" />

            <Link
              href="#reviews"
              className="text-sm font-semibold text-blue-700 transition-colors hover:underline"
              onClick={(event) => {
                event.preventDefault();

                document
                  .getElementById("reviews")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              ({reviews.length}) {reviews.length === 1 ? "Review" : "Reviews"}
            </Link>
          </div>

          <div>
            <PriceDisplay
              price={currentPrice}
              regularPrice={currentRegularPrice}
              salePrice={currentSalePrice}
              onSale={currentOnSale}
              size="md"
            />

            <span className="ml-2 text-sm text-muted-foreground">
              (Incl. of all taxes)
            </span>
          </div>

          {/* <p className="text-[15px] font-bold text-blue-700">Buy now, pay in easy EMIs at the checkout.</p> */}

          <EMIOptions price={currentPrice} />

          <div className="grid gap-4 md:grid-cols-2">
            <EarnPoints
              price={currentPrice}
              earnRate={0.01}
              redemptionValue={1}
            />

            <PincodeChecker />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StockBadge product={selectedVariation || product} showQuantity />

            <div className="space-y-2">
              <DeliveryInfo price={currentPrice} freeShippingThreshold={499} />
            </div>
          </div>

          {exchangeCategory && (
            <ApplianceExchangeProduct
              productPrice={currentPrice}
              exchangeCategory={exchangeCategory}
              onExchangeChange={setExchange}
            />
          )}

          {warrantyCategory && (
            <ExtendedWarranty
              productPrice={currentPrice}
              warrantyCategory={warrantyCategory}
              selected={Boolean(extendedWarranty)}
              onChange={setExtendedWarranty}
            />
          )}

          <Separator />

          {product.type === "variable" && (
            <VariationSelector
              product={product}
              variations={variations}
              onVariationChange={(variation) => {
                setSelectedVariation(variation);

                // Reset both optional services when variation price changes.
                setExchange(null);
                setExtendedWarranty(null);
              }}
            />
          )}

          <div className="pt-4">
            <AddToCartButton
              product={product}
              variation={selectedVariation}
              exchange={exchange}
              extendedWarranty={extendedWarranty}
            />
          </div>

          <Separator />

          {product.short_description && (
            <div className="space-y-4">
              <Prose className="max-w-none">
                <div
                  className={cn(
                    "product_short-description prose-sm prose-slate text-[14px] leading-relaxed text-muted-foreground transition-all",
                    !isExpanded && "line-clamp-3"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              </Prose>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            </div>
          )}

          <div className="space-y-3 pt-2 text-sm">
            {(selectedVariation?.sku || product.sku) && (
              <p className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">SKU:</span>

                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
                  {selectedVariation?.sku || product.sku}
                </span>
              </p>
            )}

            {product.tags.length > 0 && (
              <p>
                <span className="font-medium text-muted-foreground">Tags:</span>{" "}
                {product.tags.map((tag, index) => (
                  <span key={tag.id}>
                    <Link
                      href={`/shop?tag=${tag.slug}`}
                      className="hover:underline"
                    >
                      {tag.name}
                    </Link>

                    {index < product.tags.length - 1 && ", "}
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