"use client";

import { StarRating } from "./star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // From shadcn/ui
import { CheckCircle2, ThumbsUp, Flag, User } from "lucide-react";
import type { ProductReview } from "@/lib/woocommerce.d";
import Image from "next/image";

interface ProductReviewsListProps {
  reviews: ProductReview[];
}

export function ProductReviewsList({ reviews }: ProductReviewsListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed rounded-2xl bg-zinc-50/50">
        <p className="text-zinc-500 font-medium italic">
          No reviews yet. Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="group relative bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300">
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* 1. Reviewer Avatar */}
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                {review.reviewer_avatar_urls?.['96'] ? (
                  <img 
                    src={review.reviewer_avatar_urls['96']} 
                    alt={review.reviewer}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="text-zinc-400" size={20} />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 text-base leading-none">
                    {review.reviewer}
                  </span>
                  {review.verified && (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] gap-1 px-2 py-0.5 font-bold uppercase tracking-wider">
                      <CheckCircle2 size={10} strokeWidth={3} /> Verified
                    </Badge>
                  )}
                </div>
                {/* Star Rating on the right */}
                <StarRating rating={review.rating} size={14} />
              </div>
              
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">
                {new Date(review.date_created).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {/* Review Content */}
          <div 
            className="text-zinc-700 text-[15px] leading-relaxed prose prose-zinc prose-sm max-w-none mb-6 italic pl-1 border-l-2 border-zinc-100"
            dangerouslySetInnerHTML={{ __html: review.review }} 
          />

          {/* 3. Interaction Bar (Modern UI) */}
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-50">
            <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-tight">
              <ThumbsUp size={14} />
              Helpful
            </button>
            <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-tight ml-auto">
              <Flag size={14} />
              Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
