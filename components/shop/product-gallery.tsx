"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

// Required Styles
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import type { ProductImage } from "@/lib/woocommerce.d";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, active: false });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No image available
      </div>
    );
  }

  const selectedImage = images[selectedIndex];
  
  // Format images for Lightbox
  const slides = images.map((img) => ({
    src: img.src,
    alt: img.alt || productName,
  }));

  // Handle Hover Zoom Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y, active: true });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Display with Hover Zoom */}
      <div 
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomPos((prev) => ({ ...prev, active: false }))}
        onClick={() => setIsOpen(true)}
      >
        {/* Base Image optimized for LCP */}
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt || productName}
          fill
          priority
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-opacity duration-300",
            zoomPos.active ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Magnifying Glass Overlay */}
        {zoomPos.active && (
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-75"
            style={{
              backgroundImage: `url(${selectedImage.src})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: "250%", // Adjust for zoom intensity
              backgroundRepeat: "no-repeat"
            }}
          />
        )}
      </div>

      {/* Thumbnails Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
          {images.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all snap-start",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt || `${productName} preview ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={selectedIndex}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
        zoom={{ scrollToZoom: true, maxZoomPixelRatio: 3 }}
        thumbnails={{
          position: "bottom",
          width: 120,
          height: 80,
          gap: 10,
        }}
        // Ensures smooth transition between component and lightbox state
        on={{
          view: ({ index }) => setSelectedIndex(index)
        }}
      />
    </div>
  );
}
