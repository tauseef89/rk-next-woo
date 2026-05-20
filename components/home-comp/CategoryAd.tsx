import Link from "next/link";
import Image from "next/image";

async function getCategoryAd(categorySlug: string) {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  // We fetch only 1 ad for the sidebar/section
  const res = await fetch(
    `${wpUrl}/wp-json/wp/v2/hero_ad?_embed&filter[category_name]=${categorySlug}&per_page=1`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return null;
  const ads = await res.json();
  return ads[0] || null;
}

export default async function CategoryAd({ categorySlug }: { categorySlug: string }) {
  const ad = await getCategoryAd(categorySlug);

  if (!ad) return <div className="w-full h-full bg-muted rounded-xl border border-dashed" />;

  const img = ad._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const link = ad.link_url || ad.meta?.link_url || "#";

  return (
    <Link href={link} className="block relative w-full h-full min-h-78 overflow-hidden rounded-xl border group">
      {img ? (
        <Image
          src={img}
          alt={ad.title.rendered}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">No Ads</div>
      )}
    </Link>
  );
}
