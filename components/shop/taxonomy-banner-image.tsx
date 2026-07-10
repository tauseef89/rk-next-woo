// components/shop/taxonomy-banner-image.tsx

import HomeHero from "@/components/home-comp/home-hero";

type TaxonomyBannerType = "category" | "tag" | "brand";

interface TaxonomyBannerImageProps {
  type: TaxonomyBannerType;
  slug: string;
}

function getWordPressUrl() {
  return (
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    process.env.WORDPRESS_URL ||
    ""
  ).replace(/\/$/, "");
}

function getTaxonomyEndpoint(type: TaxonomyBannerType) {
  if (type === "category") return "product_cat";
  if (type === "tag") return "product_tag";
  return "product_brand";
}

async function getMediaById(mediaId: number): Promise<string> {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !mediaId) return "";

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/media/${mediaId}?_fields=source_url`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!res.ok) return "";

    const data = await res.json();
    return data?.source_url || "";
  } catch {
    return "";
  }
}

async function normalizeAcfImage(image: unknown): Promise<string> {
  if (!image) return "";

  // ACF image ID as number
  if (typeof image === "number") {
    return await getMediaById(image);
  }

  // ACF image URL or numeric string ID
  if (typeof image === "string") {
    const trimmedImage = image.trim();

    if (/^\d+$/.test(trimmedImage)) {
      return await getMediaById(Number(trimmedImage));
    }

    return trimmedImage;
  }

  // ACF image object/array
  if (typeof image === "object") {
    const img = image as any;

    return (
      img?.url ||
      img?.source_url ||
      img?.sizes?.full ||
      img?.sizes?.large ||
      img?.sizes?.medium_large ||
      img?.sizes?.medium ||
      ""
    );
  }

  return "";
}

async function getTermBySlug(type: TaxonomyBannerType, slug: string) {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !slug) return null;

  const taxonomyEndpoint = getTaxonomyEndpoint(type);

  try {
    const cleanSlug = decodeURIComponent(slug);

    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/${taxonomyEndpoint}?slug=${encodeURIComponent(
        cleanSlug
      )}&_fields=id,name,slug,parent,acf`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return Array.isArray(data) ? data[0] : null;
  } catch {
    return null;
  }
}

async function getTermById(type: TaxonomyBannerType, termId: number) {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !termId) return null;

  const taxonomyEndpoint = getTaxonomyEndpoint(type);

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/${taxonomyEndpoint}/${termId}?_fields=id,name,slug,parent,acf`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

async function getChildTerms(type: TaxonomyBannerType, parentId: number) {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !parentId) return [];

  const taxonomyEndpoint = getTaxonomyEndpoint(type);

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/${taxonomyEndpoint}?parent=${parentId}&per_page=100&_fields=id,name,slug,parent,acf`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getImageFromTerm(term: any): Promise<string> {
  const bannerImage = term?.acf?.banner_image;

  if (!bannerImage) return "";

  return await normalizeAcfImage(bannerImage);
}

async function getBannerWithFallback(
  type: TaxonomyBannerType,
  slug: string
): Promise<string> {
  const currentTerm = await getTermBySlug(type, slug);

  if (!currentTerm) return "";

  // 1. Current category/tag/brand banner image
  const currentImage = await getImageFromTerm(currentTerm);

  if (currentImage) return currentImage;

  // Tags do not need parent/child fallback
  if (type === "tag") return "";

  // 2. Parent category/brand banner image
  if (currentTerm.parent) {
    const parentTerm = await getTermById(type, Number(currentTerm.parent));
    const parentImage = await getImageFromTerm(parentTerm);

    if (parentImage) return parentImage;
  }

  // 3. Child category/brand banner image
  const childTerms = await getChildTerms(type, Number(currentTerm.id));

  for (const childTerm of childTerms) {
    const childImage = await getImageFromTerm(childTerm);

    if (childImage) return childImage;
  }

  return "";
}

async function getTaxonomyBannerImage(
  type: TaxonomyBannerType,
  slug: string
): Promise<string> {
  return await getBannerWithFallback(type, slug);
}

export async function TaxonomyBannerImage({
  type,
  slug,
}: TaxonomyBannerImageProps) {
  const imageUrl = await getTaxonomyBannerImage(type, slug);

  // If no banner image is found, show HomeHero
  if (!imageUrl) {
    return <HomeHero />;
  }

  return (
    <div className="mb-8 w-full overflow-hidden rounded-3xl bg-zinc-100">
      <img
        src={imageUrl}
        alt=""
        className="h-auto w-full object-cover"
        loading="eager"
      />
    </div>
  );
}