// components/category-product-list.tsx
import { getProducts } from "@/lib/woocommerce";
import { ProductGrid } from "@/components/shop";

interface CategoryProductListProps {
  categoryId: number;
  count?: number;
}

export default async function CategoryProductList({
  categoryId,
  count = 4,
}: CategoryProductListProps) {
  const { data: products } = await getProducts(1, count, {
    category: categoryId,
  });

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-6 py-8">
      <ProductGrid products={products} columns={4} />
    </div>
  );
}
