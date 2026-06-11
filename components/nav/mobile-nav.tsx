"use client";

// React and Next Imports
import * as React from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

// Utility Imports
import { Menu, ArrowRightSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Component Imports
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { mainMenu, contentMenu, MEGA_MENU_CONFIG } from "@/menu.config";
import { siteConfig } from "@/site.config";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-10 border px-0 text-base hover:bg-gray-100 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[88vw] max-w-[360px] pr-0">
        <SheetHeader>
          <SheetTitle className="text-left">
            <MobileLink
              href="/"
              className="flex items-center"
              onOpenChange={setOpen}
            >
              <ArrowRightSquare className="mr-2 h-4 w-4" />
              <span>{siteConfig.site_name}</span>
            </MobileLink>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-0 pr-6">
          <div className="flex flex-col space-y-4">

            {/* MOBILE MEGA MENU */}
            <div>
              <h3 className="mb-2 pt-4 text-sm font-semibold uppercase text-gray-500">
                Shop Categories
              </h3>
              <Separator />

              <div className="mt-3 flex flex-col space-y-2">
                {MEGA_MENU_CONFIG.map((parent) => (
                  <details
                    key={parent.slug}
                    className="group rounded-lg border border-gray-100 bg-white"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-bold uppercase text-blue-950 [&::-webkit-details-marker]:hidden">
                      <span>{parent.name}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="border-t border-gray-100 px-3 pb-3 pt-2">

                      <div className="flex flex-col space-y-4">
                        {parent.columns?.map((column, idx) => (
                          <div key={`${parent.slug}-${idx}`}>
                            <h4 className="mb-2 text-xs font-extrabold uppercase text-gray-900">
                              {column.title}
                            </h4>

                            <ul className="flex flex-col space-y-2">
                              {column.links.map((link) => (
                                <li key={link.slug}>
                                  <MobileLink
                                    href={`/shop/tag/${link.slug}`}
                                    onOpenChange={setOpen}
                                    className="text-sm font-normal text-gray-600 hover:text-blue-700"
                                  >
                                    {link.name}
                                  </MobileLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* MAIN MENU */}
            <div>
              <h3 className="mb-2 mt-4 text-sm font-semibold uppercase text-gray-500">
                Menu
              </h3>
              <Separator />

              <div className="mt-3 flex flex-col space-y-3">
                {Object.entries(mainMenu).map(([key, href]) => (
                  <MobileLink key={key} href={href} onOpenChange={setOpen}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </MobileLink>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onOpenChange?.(false);
        router.push(href.toString());
      }}
      className={cn(
        "block text-base font-medium text-gray-800 transition-colors hover:text-red-800",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}