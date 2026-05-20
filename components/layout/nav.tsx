"use client"; // <--- Add this exactly on line 1

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/nav/mobile-nav";
import { CartDrawer } from "@/components/shop";
import { categoryMenu } from "@/menu.config";
import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import Logo from "@/public/main-logo.png";
import { NavSearch } from "./nav-search";
import { StoreLocator } from "./store-locator";
import { DeliveryPicker } from "./delivery-picker";
import MegaMenu from "../nav/mega-menu";
import { CircleUser, Heart } from "lucide-react";
import { WishlistSync } from "../shop/wishlist-sync";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";

interface NavProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export function Nav({ className, children, id }: NavProps) {
  const [user, setUser] = useState<any>(null);
  const items = useWishlistStore((state) => state.items); // ✅ Get wishlist items
  
  useEffect(() => {
    const token = localStorage.getItem("woo-token");
    if (token) {
      // Fetch user to provide to WishlistSync
      fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  return (
    <>
    <div className="bg-blue-950">
      <div className="max-w-7xl mx-auto text-white py-2">
        <div className="flex justify-between align-middle">
          <div className="capitalize font-light text-[13px]">24X7 Support : <span className="text-[16px]">1800 1200 1200</span></div>
          <div className="font-light text-[13px]"><Link href="/investors" className="px-4 py-3 h-10  rounded-md">Investors</Link> | <Link href="/loyalty" className="px-4 py-3 h-10  rounded-md">Loyalty Hub</Link></div>
        </div>
      </div>
    </div>
    <nav
      className={cn("sticky z-50 top-0 bg-gray-100 pt-2", className)}
      id={id}
    >
      <div
        id="nav-container"
        className="max-w-7xl lg:px-0 mx-auto py-4 px-6 sm:px-8 flex justify-between items-center"
      >
       <div className="flex gap-20">
         <Link
          className="hover:opacity-75 transition-all flex gap-4 items-center"
          href="/"
        >
          <Image
            src={Logo}
            alt="Logo"
            loading="eager"
            className="dark:invert"
            width={180}
            height={100}
          />
          
        </Link>
        {/* Top Bar for Location/Delivery */}
      <DeliveryPicker />
       </div>
        <div>
          <NavSearch />
        </div>
        
        {children}
        <div className="flex gap-3">
          <StoreLocator />
          <Link href="/account" className="flex items-center gap-1.5 text-[14px] font-medium hover:text-red-800 bg-gray-100 transition-colors rounded-full py-2 px-3"><CircleUser className="h-5 w-5" /></Link>
          {/* <Link href="/wishlist" className="flex items-center gap-1.5 text-[14px] font-medium hover:text-red-800 bg-gray-100 transition-colors rounded-full py-2 px-3"><Heart className="h-5 w-5" /></Link> */}

        <CartDrawer />
        <MobileNav />
        </div>
        
      </div>
      <MegaMenu />
      {user && <WishlistSync user={user} />}
    </nav>
    </>
  );
}
