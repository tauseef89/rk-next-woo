import Link from "next/link";
import { MEGA_MENU_CONFIG } from "@/menu.config";

export default function FooterMegaMenu() {
  return (
    <>
      {MEGA_MENU_CONFIG.map((parent) => (
        <div key={parent.slug} className="static py-6 border-b border-white/10 last:border-0">
          {/* Category Header */}
          <h4 className="mb-4 text-white font-bold uppercase text-[14px] tracking-wide">
            {parent.name}
          </h4>

          {/* Links Container */}
          <div className="flex flex-wrap items-center gap-y-3">
            {parent.columns?.map((column) => (
              column.links.map((link, linkIdx) => (
                <div key={link.slug} className="flex items-center">
                  <Link
                    href={`/shop/category/${link.slug}`}
                    className="text-[13px] font-normal text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {link.name}
                  </Link>
                  
                  {/* The Separator Line */}
                  <div className="h-3 w-[1px] bg-gray-600 mx-5 opacity-50" />
                </div>
              ))
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
