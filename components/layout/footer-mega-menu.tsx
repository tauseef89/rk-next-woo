import Link from "next/link";
import { MEGA_MENU_CONFIG } from "@/menu.config";

export default function FooterMegaMenu() {
  return (
    <>
      {MEGA_MENU_CONFIG.map((parent) => {
        const links = parent.columns?.flatMap((column) => column.links) || [];

        return (
          <div
            key={parent.slug}
            className="static border-b border-white/10 py-6 last:border-0"
          >
            {/* Category Header */}
            <h4 className="mb-4 text-[14px] font-bold uppercase tracking-wide text-white">
              {parent.name}
            </h4>

            {/* Links Container */}
            <div className="relative">
              <div className="flex flex-wrap items-center gap-y-3 overflow-hidden md:h-6 md:flex-nowrap md:whitespace-nowrap md:pr-14">
                {links.map((link, index) => (
                  <div
                    key={`${parent.slug}-${link.slug}-${index}`}
                    className="flex shrink-0 items-center"
                  >
                    <Link
                      href={`/shop/category/${link.slug}`}
                      className="whitespace-nowrap text-[13px] font-normal text-gray-400 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>

                    {index !== links.length - 1 && (
                      <div className="mx-5 h-3 w-[1px] bg-gray-600 opacity-50" />
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Ellipsis */}
              {links.length > 0 && (
                <div className="pointer-events-none absolute right-0 top-0 hidden h-6 items-center bg-blue-950 pl-4 text-[13px] font-bold text-gray-400 md:flex">
                  ...
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}