// app/shop/tag/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  getFilteredProducts,
  getProductTagBySlug,
  getAllAttributes,
  getAttributeTerms,
  getProductBrands // Fetches global brand library list
} from "@/lib/woocommerce";

import { Section, Container } from "@/components/craft";
import { ProductGrid } from "@/components/shop";
import { FilterSidebar } from "@/components/shop/filter-sidebar"; 
import { PaginationWrapper } from "@/components/shop/pagination-wrapper";
import { TaxonomyBannerImage } from "@/components/shop/taxonomy-banner-image";

// Brands are managed separately through the custom taxonomy slot, so exclude pa_brand here
const ALLOWED_ATTRIBUTES = ["pa_capacity", "pa_star-rating", "pa_color"];

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<any>;
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const tag = await getProductTagBySlug(slug);
  if (!tag) notFound();

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  // 1. Fetch Filters, Global Brands, and Tagged Products in Parallel
  const [allAttributes, rawGlobalBrands, productsResponse, filterReferenceResponse] = await Promise.all([
    getAllAttributes(),
    getProductBrands(),
    getFilteredProducts(page, 12, { 
      ...sParams, 
      tag: tag.id, 
      min_price: sParams.min_price ? Number(sParams.min_price) : undefined,
      max_price: sParams.max_price ? Number(sParams.max_price) : undefined,
    }),
    // Reference payload pass: fetches up to 100 items with this tag to parse active properties
    getFilteredProducts(1, 100, { tag: tag.id }) 
  ]);

  // 2. Build look-up sets for BOTH attributes and custom brand taxonomies inside this tag context
  const availableTermsInSet = new Set<string>();
  const availableBrandIdsInSet = new Set<number>();

  filterReferenceResponse.data.forEach((product: any) => {
    // A. Parse and collect regular attribute string choices
    product.attributes?.forEach((attr: any) => {
      attr.options?.forEach((option: string) => {
        availableTermsInSet.add(option.trim().toLowerCase());
      });
    });

    // B. Parse and collect brand taxonomy IDs linked to the tagged products
    const productBrands = product.brands || product.product_brand || [];
    productBrands.forEach((b: any) => {
      if (b.id) availableBrandIdsInSet.add(b.id);
    });
  });

  // 3. Filter your generic global attributes down to match ONLY this tag's terms
  const attributes = await Promise.all(
    allAttributes
      .filter((attr: any) => ALLOWED_ATTRIBUTES.includes(attr.slug))
      .map(async (attr: any) => {
        const allTerms = await getAttributeTerms(attr.id);
        const filteredOptions = allTerms
          .filter((term: any) => availableTermsInSet.has(term.name.trim().toLowerCase()))
          .map((term: any) => ({ label: term.name, value: term.id.toString() }));

        return {
          id: attr.slug,
          label: attr.name,
          options: filteredOptions,
        };
      })
  );

  // 4. Filter down your global brand taxonomy catalog to match ONLY brands present under this tag
  const formattedTagBrands = rawGlobalBrands
    .filter((brand: any) => availableBrandIdsInSet.has(brand.id))
    .map((brand: any) => ({
      label: brand.name,
      value: brand.id.toString()
    }));

  const activeAttributes = attributes.filter(attr => attr.options.length > 0);
  const { data: products, headers } = productsResponse;

  return (
    <Section className="py-0 md:py-0">
      <Container className="max-w-7xl lg:px-0">
        <div className="space-y-8">         
          <TaxonomyBannerImage type="tag" slug={slug} />

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar with Filtered Attributes */}
            <aside className="w-full md:w-72 shrink-0">
               <div className="sticky top-24">
                  {/* Pipes only the brands physically present inside this tag structure */}
                  <FilterSidebar 
                    attributes={activeAttributes} 
                    brands={formattedTagBrands} 
                  />
               </div>
            </aside>

            <div className="flex-1">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6 justify-end border-b pb-4">
                <Link href="/shop" className="hover:text-foreground text-xs uppercase">Shop</Link>
                <span>/</span>
                <span className="text-xs uppercase text-muted-foreground">Tag</span>
                <span>/</span>
                <span 
                    className="text-foreground font-medium" 
                    dangerouslySetInnerHTML={{ __html: tag.name }} 
                />
                <span className="mx-2 text-border">|</span>
                <p className="text-muted-foreground">
                  Showing <span className="text-foreground font-semibold">{headers.total}</span> products
                </p>
              </nav>

              {products.length > 0 ? (
                <>
                  <ProductGrid products={products} columns={3} />
                  <PaginationWrapper totalPages={headers.totalPages} page={page} />
                </>
              ) : (
                <div className="py-32 text-center border rounded-xl border-dashed">
                  <p className="text-muted-foreground text-lg">No products match your current filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
