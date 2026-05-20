"use client";

import { useState } from "react";
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { 
  ShoppingBag, Coins, Gift, Zap, Store, Globe, 
  Smartphone, Star, Cake, ArrowRightLeft, Navigation,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoyaltyPage() {
  const [amount, setAmount] = useState<number>(50000);
  const pointsEarned = Math.floor(amount / 100);

  return (
    <div className="bg-white overflow-hidden">
      {/* 1. CREATIVE HERO: THE VOID */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-blue-950 text-white py-10">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"></div>
        
        <Container className="max-w-7xl relative z-10 md:p-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
                <Star size={14} fill="currentColor" /> RR Elite Membership
              </div>
              <h1 className="text-5xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.95]">
                You don’t just shop with Rakesh Retails, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">You experience excellence!</span>
              </h1>
              <p className="max-w-xl text-zinc-400 text-lg leading-relaxed font-medium">
                Shop at Rakesh Retails and unlock rewards with every purchase. Join the Rakesh Retails Rewards Programme for exclusive member pricing, early access to new arrivals, and special cashback offers.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200 px-10 font-bold uppercase tracking-widest text-[11px] h-14 group">
                  <Link href="/shop" className="flex items-center gap-2">
                    Shop Now <Navigation size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Floating Rewards Card */}
            <div className="relative hidden lg:block">
              <div className="relative z-20 bg-linear-to-br from-zinc-800 to-zinc-900 p-8 rounded-[2.5rem] border border-zinc-700 shadow-2xl backdrop-blur-xl">
                 <div className="flex justify-between items-start mb-12">
                   <div className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                      <Coins className="text-white" />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Points Valuations</p>
                      <p className="text-2xl font-black text-white italic">1 PT = ₹1.00</p>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Rewards Estimator</p>
                   <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-zinc-800 border-zinc-700 h-16 rounded-2xl text-2xl font-black text-blue-400 focus:ring-blue-500"
                    />
                    <div className="pt-4 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-black text-zinc-500">You Earn</p>
                        <p className="text-4xl font-black text-white">{pointsEarned} <span className="text-sm font-normal text-zinc-500">PTS</span></p>
                      </div>
                      <Link href="/account" className="text-xs font-bold text-blue-500 underline underline-offset-4">Check Balance</Link>
                    </div>
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. HOW IT WORKS: OVERLAPPING GRID */}
      <Section className="relative z-30">
        <Container className="max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ShoppingBag, t: "Shop Products", d: "Shop your favorite products from the nearby Rakesh Retail Store.", c: "bg-white" },
              { icon: Coins, t: "Earn Points", d: "Earn 1 Loyalty point on the purchase of every Rs. 100.", c: "bg-blue-950 text-white" },
              { icon: Gift, t: "Redeem Rewards", d: "Use your points anytime- Point 1 = Rs. 1", c: "bg-white" },
            ].map((s, i) => (
              <div key={i} className={cn("p-10 rounded-4xl shadow-xl flex flex-col items-center text-center space-y-4 border border-zinc-100", s.c)}>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-2", i === 1 ? "bg-white/20" : "bg-zinc-100")}>
                  <s.icon className={cn(i === 1 ? "text-white" : "text-blue-600")} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight italic">{s.t}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-80">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. BENEFITS GRID */}
      <Section>
        <Container className="max-w-7xl">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16 border-b pb-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black uppercase italic tracking-tight text-zinc-900 mb-4">Exclusive Privileges</h2>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Become part of our community by being rewarded for your shopping. There are many opportunities to save with exclusive member offers you won't find anywhere else.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-blue-950 animate-spin-slow flex items-center justify-center p-2">
                <div className="h-full w-full rounded-full bg-blue-950 flex items-center justify-center text-white font-black text-xs">REWARDS</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: "Shop More to Get More!", 
                desc: "The amount of points you earn is directly based on how much you have been a patron of the store.",
                icon: Zap
              },
              { 
                title: "Ease of Redeeming", 
                desc: "Redeem all your points by purchasing at your nearest store or on the website.",
                icon: Globe
              },
              { 
                title: "Be Up to Date!", 
                desc: "You will have access to your point totals at any time, day or night, at Rakesh Retails.",
                icon: Smartphone
              },
              { 
                title: "Use Anywhere", 
                desc: "Points earned at any Rakesh Retails location can be redeemed at any of our retail stores.",
                icon: Store
              },
              { 
                title: "Birthday Surprise", 
                desc: "Come in and get additional bonus points for your birthday and a surprise gift.",
                icon: Cake
              },
              { 
                title: "Member Events", 
                desc: "Exclusive invitations to member-only events and early access to new arrivals throughout the year.",
                icon: Star
              }
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="shrink-0">
                  <benefit.icon className="text-blue-950" size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-zinc-900">{benefit.title}</h4>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. REDEMPTION: TWO WAYS MODULAR */}
      <Section className="bg-zinc-900 text-white py-24">
        <Container className="max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Two Ways Of RR Points Redemption</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* ONLINE CARD */}
            <div className="bg-zinc-800/50 p-10 rounded-[2.5rem] border border-zinc-700/50 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-950 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Online Redemption</h3>
              </div>
              <ul className="space-y-6 text-zinc-400 font-medium flex-1">
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">01</span>
                  <span>Join instantly by signing in at <strong className="text-white">rakeshretails.com</strong> to start accumulating points.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">02</span>
                  <span>Simply sign up using your <strong className="text-white">mobile number or email address</strong>.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">03</span>
                  <span>Earn points automatically for every purchase and <strong className="text-white">redeem at checkout</strong>.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">04</span>
                  <span>24/7 Customer Service available through our online help desk.</span>
                </li>
              </ul>
              <Button className="mt-10 w-full rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-xs h-14 cursor-pointer">
                Redeem Online
              </Button>
            </div>

            {/* OFFLINE CARD */}
            <div className="bg-zinc-800/50 p-10 rounded-[2.5rem] border border-zinc-700/50 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center shadow-lg shadow-white/10">
                  <Store className="text-black" size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Offline Redemption</h3>
              </div>
              <ul className="space-y-6 text-zinc-400 font-medium flex-1">
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">01</span>
                  <span>Stop by the nearest <strong className="text-white">Rakesh Retails showroom</strong> and register with your mobile number.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">02</span>
                  <span>Register at the counter during your first visit to start earning points immediately.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">03</span>
                  <span>Enjoy <strong className="text-white">member-only events</strong>, special discounts, and cashbacks throughout the year.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">04</span>
                  <span>Our staff is always ready to help you track your points and register new members.</span>
                </li>
              </ul>
              <Button variant="outline" className="mt-10 w-full rounded-2xl border-zinc-700 bg-transparent text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs h-14 cursor-pointer hover:text-white">
                <Link href="/store-locator" className="flex items-center gap-2">Find Nearest Store <ArrowRight size={16} /></Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. FINAL CTA: IMPACT */}
      <Section className="py-24">
        <Container className="max-w-7xl md:px-0">
          <div className="bg-blue-950 rounded-[4rem] p-16 text-center relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-red-600/20 blur-[120px]"></div>
             <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-12 relative z-10">
                Buy what you love and redeem your <br /> 
                <span className="text-blue-500 underline underline-offset-8">RR Loyalty Points</span> for instant rewards.
             </h3>
             <div className="flex flex-wrap justify-center gap-4 relative z-10">
                <Button asChild size="lg" className="rounded-full bg-red-900 hover:bg-blue-900 px-12 font-black uppercase text-xs h-16 shadow-2xl shadow-red-500/20">
                   <Link href="/account">Redeem Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-zinc-700 text-black hover:bg-zinc-800 px-12 font-black uppercase text-xs h-16 backdrop-blur-sm ">
                   <Link href="/store-locator" className="hover:text-white">Find Nearest Store</Link>
                </Button>
             </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
