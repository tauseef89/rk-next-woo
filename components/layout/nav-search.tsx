"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, TrendingUp, X, ArrowLeft } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function NavSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Debounced Live Fetch from your secure API route
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length >= 3) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        } catch (err) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleFullSearch = (searchTerm: string) => {
    if (!searchTerm) return;
    setOpen(false);
    setQuery("");
    router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer group">
          {/* Mobile: Just the Icon */}
          <div className="md:hidden p-2">
            <Search className="h-6 w-6 text-foreground" />
          </div>

          {/* Desktop: The Search Bar Style */}
          <div className="hidden md:relative md:flex w-full max-w-sm items-center">
            <Search className="absolute left-2.5 top-3.5 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="flex h-12 w-full rounded-3xl border border-gray-500 bg-muted/50 px-10 py-4 text-sm text-gray-600 items-center">
              Search for home appliances, TV, AC ....
            </div>
            <kbd className="absolute right-2.5 top-2.5 h-7 select-none items-center gap-2 rounded border bg-background px-2 py-1 font-mono text-[15px] font-medium opacity-100 flex">
              <span>⌘</span>K
            </kbd>
          </div>
        </div>
      </DialogTrigger>

      {/* 
         FIX: Resetting the translate-x-[-50%] on mobile with translate-x-0 
         and applying md:translate-x-[-50%] only on desktop.
      */}
      <DialogContent 
        className="fixed inset-0 z-100 flex flex-col h-screen w-screen max-w-none translate-x-0 translate-y-0 border-none bg-background p-0 duration-200 
        md:inset-auto md:left-1/2 md:top-[10%] md:h-auto md:max-h-[80vh] md:w-150 md:-translate-x-1/2 md:rounded-xl md:border md:shadow-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Live Product Search</DialogTitle>
        </DialogHeader>

        {/* Search Input Header */}
        <div className="p-4 border-b flex items-center gap-3 bg-background shrink-0">
          <button className="md:hidden p-1 hover:bg-accent rounded-full transition-colors" onClick={() => setOpen(false)}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <Search className="h-5 w-5 text-muted-foreground shrink-0 hidden md:block" />
          
          <Input
            placeholder="Search for Electronics, Appliances..."
            className="flex-1 border-none focus-visible:ring-0 shadow-none text-lg h-10 px-0 md:px-2"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFullSearch(query)}
          />

          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            query && (
              <button onClick={() => setQuery("")} className="p-1 hover:bg-accent rounded-full">
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            )
          )}
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-background">
          {/* Trending View (Visible when query is short) */}
          {query.length < 3 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Trending Now</span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {["Split AC", "Window AC", "Air Fryer", "Refrigerator", "iPhone"].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleFullSearch(item)}
                    className="text-sm bg-secondary hover:bg-primary hover:text-white px-4 py-2.5 rounded-full text-left sm:text-center transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results */}
          {results.length > 0 && (
            <div className="py-2">
              <div className="px-4 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matching Products</div>
              {results.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 p-3 hover:bg-accent rounded-lg transition-colors group mx-2"
                >
                  <div className="h-14 w-14 rounded-md bg-muted overflow-hidden relative shrink-0 border">
                    {product.images?.[0] && (
                      <Image 
                        src={product.images[0].src} 
                        alt={product.name} 
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate group-hover:text-primary">{product.name}</h4>
                    <div 
                      className="text-sm font-bold text-primary mt-1" 
                      dangerouslySetInnerHTML={{ __html: product.price_html }} 
                    />
                  </div>
                </Link>
              ))}
              
              <div className="p-4 mt-2 border-t">
                <Button 
                  className="w-full font-bold h-12" 
                  onClick={() => handleFullSearch(query)}
                >
                  See all results for "{query}"
                </Button>
              </div>
            </div>
          )}

          {/* No Results State */}
          {query.length >= 3 && !loading && results.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              <p>No products found for "{query}"</p>
              <Button variant="link" onClick={() => setQuery("")} className="mt-2">Clear search</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
