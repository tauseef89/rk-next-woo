// app/shop/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";

// WooCommerce API functions
import { 
  getProductBySlug, 
  getProductVariations, 
  getProductReviews, 
  getRelatedProducts 
} from "@/lib/woocommerce";

// Layout and UI components
import { Section, Container, Prose } from "@/components/craft";
import { ProductGrid } from "@/components/shop";
import { ProductView } from "@/components/shop/ProductView";
import { ProductReviewsList } from "@/components/shop/product-reviews-list";
import { StarRating } from "@/components/shop/star-rating";
import { ProductSpecifications } from "@/components/shop/product-specifications";

// shadcn/ui Tabs components
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { WriteReviewForm } from "@/components/shop/write-review-form";
import { RatingSummary } from "@/components/shop/rating-summary";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. Fetch core product data
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // 2. Fetch supplemental data in parallel
  const [variations, reviews, relatedProducts] = await Promise.all([
    product.type === "variable" ? getProductVariations(product.id) : [],
    getProductReviews(product.id),
    getRelatedProducts(product.id, 4),
  ]);

  // --- ADD THIS FALLBACK LOGIC ---
  const hasNoReviews = product.rating_count === 0 || reviews.length === 0;
  
  const displayRating = hasNoReviews ? "5.0" : product.average_rating;
  const displayCount = hasNoReviews ? 3 : product.rating_count;
  // -------------------------------

  return (
    <Section>
      <Container className="max-w-7xl md:p-0">
        <div className="space-y-12">
          
          {/* A. Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground truncate font-medium">{product.name}</span>
          </nav>
          {/* B. Main Product Section (Gallery, Price, Variations, Add to Cart) */}
          <ProductView 
            product={{
              ...product,
              average_rating: displayRating,
              rating_count: displayCount
            }}  
            variations={variations} 
            reviews={reviews} 
          />

          {/* C. Tabbed Content Section */}
          <div className="pt-12 border-t">
            <Tabs defaultValue="description" className="w-full">
              {/* Tab Navigation Bar */}
              <TabsList className="grid w-full grid-cols-3 mb-10 bg-zinc-100/60 p-1 h-auto rounded-xl">
                <TabsTrigger 
                  value="description" 
                  className="py-3 font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="specs" 
                  className="py-3 font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="py-3 font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  Reviews ({product.rating_count})
                </TabsTrigger>
              </TabsList>

              {/* Tab Content: Description */}
              <TabsContent value="description" className="animate-in fade-in-50 duration-500 outline-none">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">
                    Product Description
                  </h2>
                  <Prose>
                    <div 
                      className="text-zinc-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                  </Prose>
                </div>
              </TabsContent>

              {/* Tab Content: Specifications */}
              <TabsContent value="specs" className="animate-in fade-in-50 duration-500 outline-none">
  <div className="space-y-6">
    <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-900 px-4 md:px-0">
      Technical Specifications
    </h2>

    {(() => {
      const rawValue = (product as any).acf?.technical_specifications || 
                       product.meta_data?.find((meta: any) => meta.key === "technical_specifications")?.value;

      const tableData = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;

      if (tableData && tableData.b) {
        return (
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm mx-4 md:mx-0">
            <table className="w-full text-sm text-left border-collapse">
              <tbody className="divide-y divide-zinc-100">
                {tableData.b.map((row: any, rowIndex: number) => (
                  <tr 
                    key={rowIndex} 
                    className="flex flex-col md:table-row hover:bg-zinc-50/50 transition-colors p-4 md:p-0"
                  >
                    {/* Column 1: The Label (e.g., "Display") */}
                    <td className="w-full md:w-1/3 px-0 md:px-6 py-1 md:py-4 font-bold text-zinc-900 uppercase tracking-tight text-[11px] md:text-sm bg-zinc-50/50 md:bg-transparent rounded-t-lg md:rounded-none">
                      {row[0]?.c}
                    </td>
                    
                    {/* Column 2: The Value (e.g., "Super Retina XDR") */}
                    <td className="w-full md:w-2/3 px-3 md:px-6 py-3 md:py-4 text-zinc-600 align-top whitespace-pre-line leading-relaxed">
                      {row[1]?.c}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      return <ProductSpecifications product={product} />;
    })()}
  </div>
</TabsContent>


            {/* Tab Content: Reviews */}
<TabsContent value="reviews" id="reviews" className="animate-in fade-in-50 duration-500 outline-none">
  <div className="space-y-10">
    
    {/* 1. Top Section: Rating Summary and Write Review Button */}
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b pb-10">
      <div className="flex-1">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-900 mb-6">
          Customer Feedback
        </h2>
        {/* Our new Rating Summary component */}
        <RatingSummary 
          reviews={reviews} 
          averageRating={displayRating} 
          ratingCount={displayCount} 
        />
      </div>
      
      {/* Our new Popup Review Form component */}
      <div className="shrink-0 flex flex-col items-center lg:items-end gap-3">
        <p className="text-sm text-zinc-500 font-medium">Share your thoughts with other customers</p>
        <WriteReviewForm productId={product.id} />
      </div>
    </div>

    {/* 2. Bottom Section: The List of Individual Reviews */}
    <div className="max-w-7xl">
      <h3 className="text-xl font-bold text-zinc-900 mb-8">
        Recent Reviews ({reviews.length})
      </h3>
      <ProductReviewsList reviews={reviews} />
    </div>

  </div>
</TabsContent>


            </Tabs>
          </div>

          {/* D. Related Products Grid */}
          {relatedProducts.length > 0 && (
            <div className="space-y-8 pt-12 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">
                  You May Also Like
                </h2>
                <Link href="/shop" className="text-sm font-bold text-blue-600 hover:underline">
                  View All Products
                </Link>
              </div>
              <ProductGrid products={relatedProducts} />
            </div>
          )}
          
        </div>
      </Container>
    </Section>
  );
}
