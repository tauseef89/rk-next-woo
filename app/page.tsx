// app/page.tsx
import { Section, Container } from "@/components/craft";
import Link from "next/link";
import HomeHero from "@/components/home-comp/home-hero";
import CategoryProductList from "@/components/home-comp/category-product-list";
import CategoryAd from "@/components/home-comp/CategoryAd";
import BrandList from "@/components/shop/brand-list";
import FeaturedProductGrid from "@/components/home-comp/featured-product-grid";
import CategoryCarousel from "@/components/home-comp/category-carousel";
import { getCategoriesByIds } from "@/lib/woocommerce";
import RecentPosts from "@/components/home-comp/recent-posts";
import CategoryProductListRow from "@/components/home-comp/category-product-list-row";


export default async function Home() {
  // Define your Category IDs for the carousel
  const categoryCarouselIds = [39, 70, 63, 40, 45, 57]; // Replace with your actual IDs
  const carouselCategories = await getCategoriesByIds(categoryCarouselIds);

  return (
    <>
      {/* 1. Hero Section */}
      <Section id="hero-section" className="md:py-0">
        <Container className="max-w-7xl mt-10 sm:p-0 p-0">
          <HomeHero />
        </Container>
      </Section>

      <Section id="home-main-content" className="md:py-0">
        <Container className="max-w-7xl lg:px-0 sm:p-0">
          
          {/* 2. Featured Product Grid (Now First) */}
          <FeaturedProductGrid />

          {/* 3. Category Carousel (Now Below Featured) */}
          <CategoryCarousel categories={carouselCategories} />

          <div className="w-full grid gap-6 grid-cols-4 py-12">
            <div className="">
              {/* Banner Ad */}
              <CategoryAd categorySlug="sidebar-ad" />
            </div>
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-blue-950">Today's Top <span className="text-red-700">Featured</span></h3>
        <Link 
          href={`/shop/category/steal-the-deal`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All <span className="text-red-700">→</span>
        </Link>
      </div>
             {/* 4. Category Specific Sections */}
          <CategoryProductList
            categoryId={48} 
            count={8} 
          /> 
              </div>            
          </div>
<div className="w-full grid gap-6 grid-cols-2 py-12">
            <div className="">
              {/* Banner left Ad */}
              <CategoryAd categorySlug="home-two-call-left-add" />
            </div>
          <div className="">
              {/* Banner right Ad */}
              <CategoryAd categorySlug="home-two-call-right-add" />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-4 py-8">
            <div>
              <h4 className="font-bold mb-3">Price Drop Alert</h4>
              <CategoryProductListRow 
            categoryId={76} 
            count={3} 
          />
            </div>
            <div>
              <h4 className="font-bold mb-3">New Releases</h4>
              <CategoryProductListRow 
            categoryId={77} 
            count={3} 
          />
            </div>
            <div>
              <h4 className="font-bold mb-3">Trending</h4>
              <CategoryProductListRow 
            categoryId={78} 
            count={3} 
          />
            </div>
            <div>
              <h4 className="font-bold mb-3">Top Rated</h4>
              <CategoryProductListRow 
            categoryId={79} 
            count={3} 
          />
            </div>
          </div>
          <div className="w-full py-12">
            {/* Banner mid Ad */}
              <CategoryAd categorySlug="middle-banner" />
          </div>
        </Container>
      </Section>

      {/* 5. Brands Section */}
      <Section id="home-page-brand-sec" className="md:py-0">
        <Container className="max-w-7xl lg:px-0">
          <BrandList />      
        </Container>
      </Section>
      {/* 6. Recent Blog Posts (New) */}
      <RecentPosts />
      <Section id="home-page-defence-sec" className="md:py-0">
        <Container className="max-w-7xl lg:px-0">
          <div className="w-full grid gap-6 grid-cols-2 mb-12">
            <div className="">
              {/* Banner left Ad */}
              <CategoryAd categorySlug="defence-banner" />
            </div>
          <div className="">
              {/* Banner right Ad */}
              <CategoryAd categorySlug="orphanage-banner" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
