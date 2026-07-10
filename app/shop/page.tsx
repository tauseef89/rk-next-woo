// app/shop/page.tsx

import {
  getFilteredProducts,
  getAllAttributes,
  getAttributeTerms,
  getProductBrands,
} from "@/lib/woocommerce";
import { Section, Container } from "@/components/craft";
import { ProductGrid } from "@/components/shop";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { PaginationWrapper } from "@/components/shop/pagination-wrapper";
import HomeHero from "@/components/home-comp/home-hero";
import { TaxonomyBannerImage } from "@/components/shop/taxonomy-banner-image";

// Brand is isolated entirely from this attributes scope array list
const ALLOWED_ATTRIBUTES = ["pa_capacity", "pa_star-rating", "pa_color"];

function getFirstSearchParamValue(value: any) {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return String(value).split(",")[0] || "";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const sParams = await searchParams;
  const page = Number(sParams.page) || 1;

  // Parallel fetch: get core attribute taxonomy metadata map schema along with brands taxonomy
  const [allAttributes, rawBrands] = await Promise.all([
    getAllAttributes(),
    getProductBrands(),
  ]);

  /**
   * Detect selected brand from URL query.
   * Supports multiple possible query names:
   * ?brand=48
   * ?brands=48
   * ?product_brand=48
   */
  const selectedBrandValue = getFirstSearchParamValue(
    sParams.brand || sParams.brands || sParams.product_brand
  );

  const selectedBrand = rawBrands.find((brand: any) => {
    return (
      String(brand.id) === String(selectedBrandValue) ||
      String(brand.slug) === String(selectedBrandValue)
    );
  });

  const selectedBrandSlug = selectedBrand?.slug || "";

  const [attributes, productsResponse] = await Promise.all([
    Promise.all(
      allAttributes
        .filter((attr: any) => ALLOWED_ATTRIBUTES.includes(attr.slug))
        .map(async (attr: any) => {
          const terms = await getAttributeTerms(attr.id);

          return {
            id: attr.slug,
            label: attr.name,
            options: terms.map((t: any) => ({
              label: t.name,
              value: t.id.toString(),
            })),
          };
        })
    ),

    getFilteredProducts(page, 12, {
      ...sParams,
      min_price: sParams.min_price ? Number(sParams.min_price) : undefined,
      max_price: sParams.max_price ? Number(sParams.max_price) : undefined,
    }),
  ]);

  // Convert taxonomy models securely to Term ID map values for the sidebar checkboxes
  const formattedBrands = rawBrands.map((b: any) => ({
    label: b.name,
    value: b.id.toString(),
  }));

  const { data: products, headers } = productsResponse;

  return (
    <Section className="py-0 md:py-0">
      <Container className="max-w-7xl lg:px-0">
        <div className="mb-5">
          {selectedBrandSlug ? (
            <TaxonomyBannerImage type="brand" slug={selectedBrandSlug} />
          ) : (
            <HomeHero />
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-72 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                attributes={attributes}
                brands={formattedBrands}
              />
            </div>
          </aside>

          <div className="flex-1">
            <nav className="flex items-center justify-end mb-6 border-b pb-4 text-sm text-muted-foreground">
              <span>Shop</span>
              <span className="mx-2 text-zinc-300">/</span>
              <span>
                Showing <strong>{headers.total}</strong> products
              </span>
            </nav>

            {products.length > 0 ? (
              <>
                <ProductGrid products={products} columns={3} />
                <PaginationWrapper
                  totalPages={headers.totalPages}
                  page={page}
                />
              </>
            ) : (
              <div className="py-20 text-center border rounded-xl border-dashed">
                <p className="text-muted-foreground">
                  No matching products found. We’re adding more products soon,
                  so please come back again.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}