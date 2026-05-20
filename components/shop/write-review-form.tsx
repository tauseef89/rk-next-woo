"use client";

import { useState, useTransition, useEffect } from "react";
import { Star, Pencil, Lock, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { createProductReview } from "@/lib/woocommerce";

export function WriteReviewForm({ productId }: { productId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check for login token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("woo-token");
    setToken(savedToken);
  }, []);

  async function action(formData: FormData) {
    if (!token) return;

    const reviewData = {
      review: formData.get("review") as string,
      reviewer: formData.get("reviewer") as string,
      reviewer_email: formData.get("reviewer_email") as string,
      rating: rating,
    };

    startTransition(async () => {
      try {
        await createProductReview(productId, reviewData, token);
        
        // Show Success View
        setIsSuccess(true);
        
        // Refresh the page data to show the new review
        router.refresh();

        // Auto-close dialog after 3 seconds
        setTimeout(() => {
          setOpen(false);
          // Reset success state after it closes so form returns for next time
          setTimeout(() => setIsSuccess(false), 500);
        }, 3000);

      } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // State 1: User is NOT logged in
  if (!token) {
    return (
      <Button asChild variant="outline" className="gap-2 border-zinc-300 w-full md:w-auto font-bold uppercase tracking-tight text-xs">
        <Link href="/login">
          <Lock size={14} /> Login to Write a Review
        </Link>
      </Button>
    );
  }

  // State 2: User IS logged in
  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setIsSuccess(false); // Reset if user manually closes
    }}>
      <DialogTrigger asChild>
        <Button className="bg-red-700 hover:bg-zinc-900 text-white font-bold gap-2 uppercase tracking-tight text-xs shadow-lg transition-all active:scale-95">
          <Pencil size={14} /> Write a Review
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-106.25 rounded-3xl p-0 border-none shadow-2xl overflow-hidden">
        {isSuccess ? (
          /* --- SUCCESS MESSAGE VIEW --- */
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
               <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              Review Submitted!
            </h2>
            <p className="text-zinc-500 mt-3 leading-relaxed">
              Thank you for your feedback! Your review has been sent for moderation.
            </p>
            <div className="mt-8 h-1 w-24 bg-zinc-100 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 animate-progress-shrink" style={{ width: '100%' }} />
            </div>
          </div>
        ) : (
          /* --- ORIGINAL FORM VIEW --- */
          <div className="p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900 text-center">
                Rate this Product
              </DialogTitle>
              <p className="text-center text-zinc-500 text-sm italic">Help other shoppers make better choices</p>
            </DialogHeader>

            <form action={action} className="space-y-6 pt-6">
              {/* Star Picker */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125 active:scale-90"
                    >
                      <Star 
                        size={36} 
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Average" : "Poor"}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Your Name</label>
                  <Input name="reviewer" placeholder="e.g. John Doe" required className="bg-zinc-50 border-zinc-200 h-12 focus:ring-red-700" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Email Address</label>
                  <Input name="reviewer_email" type="email" placeholder="john@example.com" required className="bg-zinc-50 border-zinc-200 h-12" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Your Review</label>
                  <Textarea 
                    name="review" 
                    placeholder="What was your experience with this product?" 
                    required 
                    rows={4} 
                    className="resize-none bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>

              <Button 
                disabled={isPending} 
                className="w-full bg-red-700 hover:bg-zinc-900 h-14 text-lg font-bold rounded-2xl shadow-xl transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    SUBMITTING...
                  </>
                ) : "SUBMIT REVIEW"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
