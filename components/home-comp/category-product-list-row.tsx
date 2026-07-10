// components/category-product-list-row.tsx
import { getProducts } from "@/lib/woocommerce";
import Image from "next/image";
import Link from "next/link";

export default async function CategoryProductListRow({
  categoryId,
  count = 4,
}: { 
  categoryId: number | string; // Updated to accept both
  count?: number 
}) {
  // Ensure categoryId is a number for the API call
  const idAsNumber = typeof categoryId === "string" ? parseInt(categoryId, 10) : categoryId;

  const { data: products } = await getProducts(1, count, {
    category: idAsNumber, // Passed as a number, not .toString()
  });

  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {products.map((product: any) => (
        <Link 
          key={product.id} 
          href={`/shop/${product.slug}`}
          className="group flex flex-col sm:flex-row gap-6 items-center p-4 border border-zinc-100 rounded-xl hover:border-red-700 transition-shadow"
        >
          {/* Product Image */}
          <div className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg bg-zinc-50">
            <Image
              src={product.images[0]?.src || '/placeholder.png'}
              alt={product.name} // Decoded alt text
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          
          {/* Product Info */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            {/* Decoded Title Fixes "TV &amp; Entertainment" */}
            <h4 className="text-sm text-blue-950 truncate max-w-48">
              {product.name}
            </h4>
            
            <div 
              className="text-red-700 text-sm" 
              dangerouslySetInnerHTML={{ __html: product.price_html }} 
            />
            
          </div>
        </Link>
      ))}
    </div>
  );
}
