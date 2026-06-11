"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  Package,
  UserCircle,
  LogOut,
  Heart,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

const navItems = [
  { name: "Dashboard", href: "/account", icon: LayoutDashboard },
  { name: "Orders", href: "/account/orders", icon: Package },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Account details", href: "/account/details", icon: UserCircle },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);

  const syncFromServer = useWishlistStore((state) => state.syncFromServer);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  const handleLogout = async () => {
    try {
      // 1. Clear server-side customer_token cookie
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      // 2. Clear old frontend/local tokens if any
      localStorage.removeItem("woo-token");
      localStorage.removeItem("customer_token");

      // 3. Clear wishlist only from local UI/Zustand
      // This does NOT delete wishlist from WordPress DB.
      clearWishlist();

      // 4. Clear auth Zustand store
      logout();

      // 5. Redirect to login
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 border-r pr-8">
          <h2 className="text-xl font-bold mb-6 italic uppercase tracking-tight">
            My Account
          </h2>

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all",
                    isActive
                      ? "bg-black text-white shadow-md"
                      : "text-muted-foreground hover:bg-zinc-100 hover:text-black"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 mt-4 px-4 py-2.5 text-sm font-medium text-red-600 text-left hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}