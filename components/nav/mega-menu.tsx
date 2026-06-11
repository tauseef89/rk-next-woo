import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MEGA_MENU_CONFIG } from "@/menu.config";
import Image from "next/image";

export default function MegaMenu() {
  return (
    <NavigationMenu className="max-w-7xl mx-auto justify-start bg-white rounded-t-lg pl-2 pt-2">
      <NavigationMenuList className="gap-1">
        {MEGA_MENU_CONFIG.map((parent) => (
          <NavigationMenuItem key={parent.slug} className="static pb-2">
            <NavigationMenuTrigger className="text-[12px] rounded-3xl uppercase font-bold tracking-tight hover:text-white hover:bg-blue-950 data-[state=open]:bg-blue-950 data-[state=open]:text-white">
              {parent.name}
            </NavigationMenuTrigger>

            <NavigationMenuContent className="fixed left-0 top-0 w-fill">
  <div className="w-screen max-w-7xl bg-white shadow-2xl animate-in fade-in slide-in-from-top-2">
    <div className="mx-auto max-w-7xl p-6 flex gap-10">  
  {/* Links Container: Automatically grows to take all available space */}
  <div className="flex-1">
    <div className={`grid gap-6 ${
      parent.columns.length === 4 ? "grid-cols-4" : 
      parent.columns.length === 3 ? "grid-cols-3" : 
      "grid-cols-5"
    }`}>
      {parent.columns?.map((column, idx) => (
        <div key={idx} className="flex flex-col space-y-3">
          <h5 className="text-[13px] font-extrabold text-blue-900 uppercase border-b border-gray-100 pb-1.5">
            {column.title}
          </h5>
          <ul className="flex flex-col space-y-1.5">
            {column.links.map((link) => (
              <li key={link.slug}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/shop/tag/${link.slug}`}
                    className="text-[12px] text-gray-500 hover:text-blue-700 transition-all block"
                  >
                    {link.name}
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>

  {/* Image Banner: Auto-adjusts width based on your logic */}
  {parent.columns.length < 5 && (
    <div 
      className="shrink-0 transition-all duration-300"
      style={{ 
        flexBasis: parent.columns.length === 4 ? '20%' : '25%' 
      }}
    >
      <Link 
        href={`/shop/category/${parent.slug}`} 
        className="group relative block aspect-[3/2] overflow-hidden rounded-lg bg-gray-100 shadow-sm"
      >
        <Image 
          src={parent.image} 
          alt={parent.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
          <h4 className="font-extrabold text-sm uppercase">{parent.name}</h4>
          <span className="text-[9px] font-bold border-b border-white pb-0.5 w-fit uppercase">Explore</span>
        </div>
      </Link>
    </div>
  )}
</div>

  </div>
</NavigationMenuContent>

          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
