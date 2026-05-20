"use client";

import { StarRating } from "./star-rating";

interface RatingSummaryProps {
  reviews: any[];
  averageRating: string;
  ratingCount: number;
}

export function RatingSummary({ reviews, averageRating, ratingCount }: RatingSummaryProps) {
  // Calculate counts for each star level (1-5)
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm">
      {/* Big Score Box */}
      <div className="text-center md:border-r md:pr-8 border-zinc-200">
        <span className="text-5xl font-black text-zinc-900">{averageRating}</span>
        <div className="flex justify-center my-2">
          <StarRating rating={Number(averageRating)} size={18} />
        </div>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
          {ratingCount} Global Reviews
        </p>
      </div>

      {/* Progress Bars for Star Distribution */}
      <div className="flex-1 w-full space-y-2">
        {distribution.map((item) => (
          <div key={item.star} className="flex items-center gap-4 group">
            <span className="text-xs font-bold text-zinc-600 w-12 shrink-0">
              {item.star} Stars
            </span>
            <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 transition-all duration-1000 ease-out" 
                role="progressbar"
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-400 w-8 text-right">
              {Math.round(item.percentage)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
