"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CircleUser } from "lucide-react";

import { MobileNav } from "@/components/nav/mobile-nav";
import { CartDrawer } from "@/components/shop";
import { cn } from "@/lib/utils";
import Logo from "@/public/main-logo.png";

import { NavSearch } from "./nav-search";
import { StoreLocator } from "./store-locator";
import { DeliveryPicker } from "./delivery-picker";
import MegaMenu from "../nav/mega-menu";
import { WishlistSync } from "../shop/wishlist-sync";
import SignupPopup from "../SignupPopup";

interface NavProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

async function readJsonSafely(response: Response) {
  const text = await response.text();

  try {
    return {
      isJson: true,
      data: JSON.parse(text),
      raw: text,
    };
  } catch {
    return {
      isJson: false,
      data: null,
      raw: text,
    };
  }
}

export function Nav({ className, children, id }: NavProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isSignupPopupOpen, setIsSignupPopupOpen] = useState(false);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const res = await fetch("/api/customer/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const parsed = await readJsonSafely(res);

        if (!parsed.isJson) {
          console.error("Customer me API returned non-JSON:", parsed.raw);
          setUser(null);
          setIsLoggedIn(false);
          return;
        }

        const data = parsed.data;

        if (res.ok && data?.success && data?.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("User check failed:", error);
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    checkLoggedInUser();
  }, []);

  return (
    <>
      {/* TOP BLUE BAR */}
      <div className="bg-blue-950">
        <div className="max-w-7xl mx-auto text-white py-2 px-4 lg:px-0">
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-center md:text-left">
            <div className="capitalize font-light text-[13px]">
              24X7 Support :{" "}
              <span className="text-[16px]">8130047218</span>
            </div>

            {isLoggedIn === false && (
              <button
                type="button"
                onClick={() => setIsSignupPopupOpen(true)}
                className="text-[13px] font-semibold text-yellow-300 hover:text-yellow-200 transition-colors animate-pulse"
              >
                🎁 Claim Your 1,000 Signup Discount
              </button>
            )}

            <div className="font-light text-[13px]">
              <Link
                href="https://rakeshretails.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 h-10 rounded-md"
              >
                Investors
              </Link>{" "}
              |{" "}
              <Link href="/loyalty" className="px-4 py-3 h-10 rounded-md">
                Loyalty Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <nav
        className={cn("sticky z-50 top-0 bg-gray-100 pt-2", className)}
        id={id}
      >
        <div
          id="nav-container"
          className="max-w-7xl lg:px-0 mx-auto py-4 px-6 sm:px-8"
        >
          {/* MOBILE TOP ROW */}
          <div className="flex items-center justify-between lg:hidden">
            <Link
              className="hover:opacity-75 transition-all flex items-center"
              href="/"
            >
              <Image
                src={Logo}
                alt="Logo"
                loading="eager"
                className="dark:invert w-[135px] h-auto"
                width={180}
                height={100}
                priority
              />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-[14px] font-medium hover:text-red-800 bg-gray-100 transition-colors rounded-full py-2 px-2"
                aria-label="My Account"
              >
                <CircleUser className="h-5 w-5" />
              </Link>

              <CartDrawer />
              <MobileNav />
            </div>
          </div>

          {/* MOBILE LOCATION + SEARCH ROW */}
          <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
            <div className="min-w-0 flex-1">
              <DeliveryPicker />
            </div>

            <div className="shrink-0 flex items-center justify-end">
              <NavSearch />
            </div>
          </div>

          {/* DESKTOP NAV - unchanged */}
          <div className="hidden lg:flex justify-between items-center">
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
                  priority
                />
              </Link>

              <DeliveryPicker />
            </div>

            <div>
              <NavSearch />
            </div>

            {children}

            <div className="flex gap-3">
              <StoreLocator />

              <Link
                href="/account"
                className="flex items-center gap-1.5 text-[14px] font-medium hover:text-red-800 bg-gray-100 transition-colors rounded-full py-2 px-3"
                aria-label="My Account"
              >
                <CircleUser className="h-5 w-5" />
              </Link>

              <CartDrawer />
              <MobileNav />
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu only */}
        <div className="hidden lg:block">
          <MegaMenu />
        </div>

        {user && <WishlistSync user={user} />}
      </nav>

      {/* SIGNUP DISCOUNT POPUP */}
      <SignupPopup
        open={isSignupPopupOpen}
        onOpenChange={setIsSignupPopupOpen}
      />
    </>
  );
}