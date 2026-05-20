"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"

export function HeroCarousel({ slides }: { slides: any[] }) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <Carousel plugins={[Autoplay({ delay: 5000 })]} opts={{ loop: true }} setApi={setApi} className="w-full group">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <Link 
              href={slide.link_url || slide.meta?.link_url || "#"} 
              className="block relative aspect-1366/400 overflow-hidden rounded-xl border"
            >
              <Image
                src={slide._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg"}
                alt={slide.title.rendered}
                fill
                priority
                className="object-cover"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Arrows - hidden on mobile, visible on hover on desktop */}
      <CarouselPrevious className="hidden md:flex left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CarouselNext className="hidden md:flex right-4 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              current === index ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Carousel>
  )
}
