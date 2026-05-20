import React from 'react';
import { Shield, Heart, GraduationCap, Truck, CheckCircle2, AlertTriangle, Users, Info } from 'lucide-react';

export default function BenefitsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* 1. Hero Section with Modern Gradient */}
<section className="relative py-28 overflow-hidden bg-slate-950">
  {/* Radial Spotlight Effect */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.3),transparent_70%)]" />
  
  {/* Mesh Gradient Background */}
  <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-[#0f172a] to-blue-900/20" />

  <div className="container relative z-10 px-4 mx-auto text-center">
    {/* Badge */}
    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-bold tracking-widest text-blue-400 uppercase border rounded-full border-blue-500/30 bg-blue-500/10">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      Social Impact Initiative
    </div>

    <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight text-white">
      Serving Those <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">Who Served.</span> <br />
      Supporting Those <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-orange-300">Who Need.</span>
    </h1>
    
    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
      Rakesh Retails is committed to contributing positively to society. 
      We believe business growth must go hand-in-hand with 
      <span className="text-white font-medium"> social impact.</span>
    </p>
  </div>


  
</section>


      {/* 2. Main Programs */}
      <section className="py-20 container px-4 mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Army Veterans Program */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Shield className="w-8 h-8" />
              <h3 className="text-3xl font-bold text-slate-900">Army Veterans Support</h3>
            </div>
            <p className="text-slate-600">Appreciating the tremendous service of former military members and their families.</p>
            
            <div className="grid gap-4">
              {[
                { title: "Discounted Rates", desc: "Special pricing on Electronics & Appliances", icon: <Shield className="w-5 h-5"/> },
                { title: "Priority Assistance", desc: "VIP service in all our retail stores", icon: <Users className="w-5 h-5"/> },
                { title: "Family Benefits", desc: "Installation & After Sale service for families", icon: <Truck className="w-5 h-5"/> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-primary mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orphanage Support Program */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-rose-500">
              <Heart className="w-8 h-8" />
              <h3 className="text-3xl font-bold text-slate-900">Orphanage Support</h3>
            </div>
            <p className="text-slate-600">Enhancing children's quality of life and improving access to digital resources.</p>
            
            <div className="grid gap-4">
              {[
                { title: "Essential Donations", desc: "TVs, Fans, & Washing Machines for homes", icon: <Heart className="w-5 h-5"/> },
                { title: "Digital Literacy", desc: "Providing access to digital learning tools", icon: <GraduationCap className="w-5 h-5"/> },
                { title: "Seasonal Drives", desc: "Clothing and educational material drives", icon: <CheckCircle2 className="w-5 h-5"/> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-rose-500 mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. How You Can Contribute - Creative Modern UI */}
<section className="relative py-24 bg-slate-950 overflow-hidden">
  {/* Decorative Background Elements */}
  <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full" />
  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-rose-600/10 blur-[120px] rounded-full" />

  <div className="container relative z-10 px-4 mx-auto max-w-7xl">
    <div className="max-w-2xl mx-auto text-center mb-16">
      <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">How You Can Help</h3>
      <p className="text-slate-400">Join our mission to create a sustainable ecosystem where businesses and communities grow together.</p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { 
          t: "Support Purchases", 
          d: "Every product you buy contributes a portion toward our veteran and orphanage funds.",
          icon: "01" 
        },
        { 
          t: "Refer Groups", 
          d: "Know an organization in need? Share their details with us for a potential partnership.",
          icon: "02" 
        },
        { 
          t: "Join Our Drives", 
          d: "Be on the front lines. Volunteer during our seasonal donation and community camps.",
          icon: "03" 
        },
        { 
          t: "Spread the Word", 
          d: "Amplify our cause. Use your voice on social media to help us reach more people.",
          icon: "04" 
        }
      ].map((step, i) => (
        <div 
          key={i} 
          className="group relative p-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-xl hover:bg-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle Hover Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Background Number Accent */}
          <span className="absolute -top-4 -right-4 text-8xl font-black text-white/3 group-hover:text-white/[0.07] transition-colors">
            {step.icon}
          </span>

          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-tr from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20">
              {step.icon}
            </div>
            
            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
              {step.t}
            </h4>
            
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
              {step.d}
            </p>
          </div>
          
          {/* Bottom Interactive Line */}
          <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-blue-500 to-rose-500 group-hover:w-full transition-all duration-700" />
        </div>
      ))}
    </div>
  </div>
</section>


      {/* 4. Guidelines & T&C - Modern Bento Style */}
<section className="py-24 container px-4 mx-auto max-w-7xl">
  <div className="grid md:grid-cols-12 gap-6">
    
    {/* Participation Do's */}
    <div className="md:col-span-6 lg:col-span-5 relative group overflow-hidden p-8 rounded-[2.5rem] bg-white border border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.05)] transition-all hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)]">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <CheckCircle2 className="w-24 h-24 text-emerald-500" />
      </div>
      
      <h3 className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase tracking-widest text-[10px] mb-6">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Participation Do&apos;s
      </h3>

      <div className="space-y-4">
        {[
          "Support verified organizations",
          "Participate in official Rakesh Retails initiatives",
          "Promote responsible and ethical contributions"
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-emerald-900/80 font-medium text-sm">{text}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Participation Don'ts */}
    <div className="md:col-span-6 lg:col-span-5 relative group overflow-hidden p-8 rounded-[2.5rem] bg-white border border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.05)] transition-all hover:shadow-[0_20px_60px_rgba(244,63,94,0.1)]">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <AlertTriangle className="w-24 h-24 text-rose-500" />
      </div>

      <h3 className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 font-bold uppercase tracking-widest text-[10px] mb-6">
        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        Participation Don&apos;ts
      </h3>

      <div className="space-y-4">
        {[
          "Avoid unauthorized collection activities",
          "Do not misuse exclusive benefits or offers",
          "Avoid engagement with unverified entities"
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-50" />
            </div>
            <p className="text-rose-900/80 font-medium text-sm">{text}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Small T&C Footer - Vertical/Side Block */}
    <div className="md:col-span-12 lg:col-span-2 flex items-stretch">
      <div className="w-full p-6 rounded-4xl bg-slate-900 text-white flex flex-col justify-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-500/20 to-transparent pointer-events-none" />
        <Info className="w-6 h-6 text-blue-400 relative z-10" />
        <div className="space-y-3 relative z-10">
          <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
            <strong className="text-white">ID Verification:</strong> Required for all veteran benefits.
          </p>
          <div className="h-px w-full bg-white/10" />
          <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
            <strong className="text-white">Policy:</strong> Subject to change based on feasibility.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* 5. Promise Footer */}
      <section className="py-12 border-t text-center">
        <p className="text-xl font-medium text-slate-900 italic">
          &quot;Together, We Don’t Just Sell — We Serve.&quot;
        </p>
      </section>
    </div>
  );
}
