import { Store } from "lucide-react";
import Link from "next/link";

export function StoreLocator() {
  return (
    <Link 
      href="/store-locator" 
      className="flex items-center gap-1.5 text-[14px] font-medium hover:text-red-800 transition-colors py-2"
    >
      <Store className="h-5 w-5" />
      <span>Store Locator</span>
    </Link>
  );
}
