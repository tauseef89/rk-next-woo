type TaxonomyBannerType = "category" | "tag";

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

async function getMediaById(mediaId: number) {
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

async function normalizeAcfImage(image: any): Promise<string> {
  if (!image) return "";

  // ACF image array
  if (typeof image === "object") {
    return (
      image?.url ||
      image?.source_url ||
      image?.sizes?.full ||
      image?.sizes?.large ||
      image?.sizes?.medium_large ||
      ""
    );
  }

  // ACF image URL
  if (typeof image === "string") {
    return image;
  }

  // ACF image ID
  if (typeof image === "number") {
    return getMediaById(image);
  }

  return "";
}

async function getTermBySlug(type: TaxonomyBannerType, slug: string) {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !slug) return null;

  const taxonomyEndpoint =
    type === "category" ? "product_cat" : "product_tag";

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/${taxonomyEndpoint}?slug=${encodeURIComponent(
        slug
      )}&_fields=id,slug,parent,acf`,
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

async function getCategoryById(categoryId: number) {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !categoryId) return null;

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/product_cat/${categoryId}?_fields=id,slug,parent,acf`,
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

async function getChildCategories(parentId: number) {
  const wpUrl = getWordPressUrl();

  if (!wpUrl || !parentId) return [];

  try {
    const res = await fetch(
      `${wpUrl}/wp-json/wp/v2/product_cat?parent=${parentId}&per_page=100&_fields=id,slug,parent,acf`,
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
  if (!term?.acf?.banner_image) return "";
  return await normalizeAcfImage(term.acf.banner_image);
}

async function getCategoryBannerWithFallback(slug: string): Promise<string> {
  const currentCategory = await getTermBySlug("category", slug);

  if (!currentCategory) return "";

  // 1. First check current category image
  const currentImage = await getImageFromTerm(currentCategory);

  if (currentImage) return currentImage;

  // 2. Then check parent category image
  if (currentCategory.parent) {
    const parentCategory = await getCategoryById(Number(currentCategory.parent));
    const parentImage = await getImageFromTerm(parentCategory);

    if (parentImage) return parentImage;
  }

  // 3. Then check child category image
  const childCategories = await getChildCategories(Number(currentCategory.id));

  for (const childCategory of childCategories) {
    const childImage = await getImageFromTerm(childCategory);

    if (childImage) return childImage;
  }

  return "";
}

async function getTagBannerImage(slug: string): Promise<string> {
  const tag = await getTermBySlug("tag", slug);

  if (!tag) return "";

  return await getImageFromTerm(tag);
}

async function getTaxonomyBannerImage(
  type: TaxonomyBannerType,
  slug: string
): Promise<string> {
  if (type === "category") {
    return await getCategoryBannerWithFallback(slug);
  }

  return await getTagBannerImage(slug);
}

export async function TaxonomyBannerImage({
  type,
  slug,
}: TaxonomyBannerImageProps) {
  const imageUrl = await getTaxonomyBannerImage(type, slug);

  if (!imageUrl) return null;

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