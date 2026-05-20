import { 
  getFilteredProducts, 
  getAllAttributes, 
  getAttributeTerms 
} from "@/lib/woocommerce";
import { Section, Container } from "@/components/craft";
import { ProductGrid } from "@/components/shop";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { PaginationWrapper } from "@/components/shop/pagination-wrapper";
import HomeHero from "@/components/home-comp/home-hero";

export default async function ShopPage({ searchParams }: { searchParams: Promise<any> }) {
  const sParams = await searchParams;
  const page = Number(sParams.page) || 1;

  // 1. Fetch Filters & Products in Parallel
  const [allAttributes] = await Promise.all([
    getAllAttributes(),
  ]);

  const [attributes, productsResponse] = await Promise.all([
    Promise.all(allAttributes.map(async (attr: any) => {
      const terms = await getAttributeTerms(attr.id);
      return {
        id: attr.slug,
        label: attr.name,
        options: terms.map((t: any) => ({ label: t.name, value: t.slug })),
      };
    })),
    getFilteredProducts(page, 12, {
      ...sParams,
      // Fix: Convert strings from URL to numbers for the fetcher
      min_price: sParams.min_price ? Number(sParams.min_price) : undefined,
      max_price: sParams.max_price ? Number(sParams.max_price) : undefined,
    }),
  ]);

  const { data: products, headers } = productsResponse;

  return (
    <Section className="py-0 md:py-0">
      <Container className="max-w-7xl lg:px-0">
        <div className="mb-5">
          <HomeHero />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-72 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar attributes={attributes} />
            </div>
          </aside>

          <div className="flex-1">
            <nav className="flex items-center justify-end mb-6 border-b pb-4 text-sm text-muted-foreground">
              <span>Shop</span>
              <span className="mx-2 text-zinc-300">/</span>
              <span>Showing <strong>{headers.total}</strong> products</span>
            </nav>

            {products.length > 0 ? (
              <>
                <ProductGrid products={products} columns={3} />
                <PaginationWrapper totalPages={headers.totalPages} page={page} />
              </>
            ) : (
              <div className="py-20 text-center border rounded-xl border-dashed">
                <p className="text-muted-foreground">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
