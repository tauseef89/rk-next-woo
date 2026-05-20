"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { Product } from "@/lib/woocommerce.d";

interface ProductSpecificationsProps {
  product: Product;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Combine custom attributes and default physical properties
  const specs = [
    // Add physical dimensions if available
    ...(product.weight ? [{ name: "Weight", value: `${product.weight} kg` }] : []),
    ...(product.dimensions.length || product.dimensions.width || product.dimensions.height
      ? [{
          name: "Dimensions",
          value: `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm`
        }]
      : []),
    // Map WooCommerce attributes (e.g., Color, Size, Material)
    ...product.attributes.map((attr) => ({
      name: attr.name,
      value: attr.options.join(", "),
    })),
  ];

  if (specs.length === 0) return null;

  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableBody>
          {specs.map((spec, index) => (
            <TableRow key={index} className="hover:bg-zinc-50 transition-colors">
              <TableCell className="font-bold text-zinc-900 bg-zinc-50/50 w-1/3 py-4 px-6 border-r">
                {spec.name}
              </TableCell>
              <TableCell className="text-zinc-600 py-4 px-6">
                {spec.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
