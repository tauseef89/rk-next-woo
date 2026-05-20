import { HeroCarousel } from "@/components/home-comp/hero-carousel";

async function getHeroAds(category: string) {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  // Note: fixed the filter query to use category_name
  const res = await fetch(
    `${wpUrl}/wp-json/wp/v2/hero_ad?_embed&filter[category_name]=${category}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return [];
  return res.json();
}

export default async function HomeHero() {
  const slides = await getHeroAds("Home Carousel");

  if (!slides.length) return null;

  return (
    <HeroCarousel slides={slides} />
  );
}
