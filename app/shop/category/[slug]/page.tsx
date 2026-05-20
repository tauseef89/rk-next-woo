import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  getFilteredProducts,
  getProductCategoryBySlug,
  getAllAttributes,
  getAttributeTerms,
} from "@/lib/woocommerce";

import { Section, Container } from "@/components/craft";
import { ProductGrid } from "@/components/shop";
import { FilterSidebar } from "@/components/shop/filter-sidebar"; 
import { PaginationWrapper } from "@/components/shop/pagination-wrapper";
import HomeHero from "@/components/home-comp/home-hero";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<any>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const category = await getProductCategoryBySlug(slug);
  if (!category) notFound();

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  // 1. Fetch Filters & Products in Parallel
  // We fetch a larger batch of products (per_page: 100) to identify all available attributes in this category
  const [allAttributes, productsResponse, filterReferenceResponse] = await Promise.all([
    getAllAttributes(),
    getFilteredProducts(page, 12, { 
      ...sParams, 
      category: category.id,
      min_price: sParams.min_price ? Number(sParams.min_price) : undefined,
      max_price: sParams.max_price ? Number(sParams.max_price) : undefined,
    }),
    getFilteredProducts(1, 100, { category: category.id }) 
  ]);

  // 2. Build a Set of attribute terms that actually exist in this category's products
  const availableTermsInSet = new Set<string>();
  filterReferenceResponse.data.forEach((product: any) => {
    product.attributes?.forEach((attr: any) => {
      attr.options?.forEach((option: string) => availableTermsInSet.add(option));
    });
  });

  // 3. Fetch Attribute Terms and filter them based on what's available in this category
  const attributes = await Promise.all(
    allAttributes.map(async (attr: any) => {
      const allTerms = await getAttributeTerms(attr.id);
      
      // Only include terms that actually appear in the products of this category
      const filteredOptions = allTerms
        .filter((term: any) => availableTermsInSet.has(term.name))
        .map((term: any) => ({ label: term.name, value: term.slug }));

      return {
        id: attr.slug,
        label: attr.name,
        options: filteredOptions,
      };
    })
  );

  // Filter out entire attribute groups (like 'Color') if they have no valid options for this category
  const activeAttributes = attributes.filter(attr => attr.options.length > 0);

  const { data: products, headers } = productsResponse;

  return (
    <Section className="py-0 md:py-0">
      <Container className="max-w-7xl lg:px-0">
        <div className="space-y-8">         

          {/* Banner */}
          <HomeHero />

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar with Filtered Attributes */}
            <aside className="w-full md:w-72 shrink-0">
               <div className="sticky top-24">
                  <FilterSidebar attributes={activeAttributes} />
               </div>
            </aside>

            <div className="flex-1">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6 justify-end border-b pb-4">
                <Link href="/shop" className="hover:text-foreground text-xs uppercase">Shop</Link>
                <span>/</span>
                <span 
                    className="text-foreground font-medium" 
                    dangerouslySetInnerHTML={{ __html: category.name }} 
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
