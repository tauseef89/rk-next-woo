"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info, Zap, CreditCard, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Data Structure for Bank Plans
const BANKS = [
  { 
    id: "hdfc", 
    name: "HDFC Bank", 
    creditRate: 15.5, 
    debitRate: 16, 
    noCostMonths: [3, 6], // Eligibility for 0% interest
    offer: "Flat ₹2,000 Instant Discount on Credit Cards" 
  },
  { 
    id: "icici", 
    name: "ICICI Bank", 
    creditRate: 15.99, 
    debitRate: 14, 
    noCostMonths: [3], 
    offer: "10% Instant Discount up to ₹1,500" 
  },
  { 
    id: "sbi", 
    name: "SBI Card", 
    creditRate: 14.5, 
    debitRate: 15.1, 
    noCostMonths: [], 
    offer: "Extra 5% Cashback on SBI Credit Cards" 
  },
  { 
    id: "axis", 
    name: "Axis Bank", 
    creditRate: 16, 
    debitRate: 16, 
    noCostMonths: [3, 6], 
    offer: "No Cost EMI for up to 6 Months" 
  },
];

interface EMIOptionsProps {
  price: string;
}

export function EMIOptions({ price }: EMIOptionsProps) {
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");
  
  // Clean price string to numeric (e.g., "₹70,000" -> 70000)
  const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-IN", { 
      style: "currency", 
      currency: "INR", 
      maximumFractionDigits: 0 
    }).format(val);

  // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  const calculateEMI = (principal: number, annualRate: number, months: number, isNoCost: boolean) => {
    if (isNoCost) return Math.round(principal / months);
    const r = annualRate / 12 / 100;
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  // Base starting EMI (calculated on 24 months at standard 15% rate)
  const startingEMIAmount = calculateEMI(numericPrice, 15, 24, false);

  return (
    <div className="space-y-3">
      {/* A. Starting From Display */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-[15px] text-zinc-600">
          Standard EMI starting from <span className="font-bold text-zinc-900">{formatCurrency(startingEMIAmount)}/mo</span>
        </p>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-sm font-bold text-blue-700 underline underline-offset-4 hover:text-blue-800 transition-colors">
              See all bank plans
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden gap-0">
            {/* Popup Header */}
            <div className="p-6 bg-zinc-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Landmark className="text-blue-400" size={20} />
                  Bank Offers & EMI
                </DialogTitle>
                <DialogDescription className="text-zinc-400 mt-1">
                  Choose your bank and card type to view specific installments.
                </DialogDescription>
              </div>

              {/* Credit/Debit Toggle */}
              <div className="inline-flex bg-zinc-800 p-1 rounded-xl border border-zinc-700">
                {(["credit", "debit"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCardType(type)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      cardType === type 
                        ? "bg-white text-zinc-950 shadow-lg" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar & Content Layout */}
            <Tabs defaultValue="hdfc" className="flex flex-col md:flex-row h-[420px]">
              <TabsList className="flex md:flex-col h-auto md:w-44 bg-zinc-50 p-2 justify-start rounded-none border-r space-y-1">
                {BANKS.map((bank) => (
                  <TabsTrigger 
                    key={bank.id} 
                    value={bank.id}
                    className="w-full justify-start py-3 font-bold text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {bank.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {BANKS.map((bank) => {
                  const rate = cardType === "credit" ? bank.creditRate : bank.debitRate;
                  return (
                    <TabsContent key={bank.id} value={bank.id} className="m-0 space-y-6 animate-in fade-in-50 duration-300">
                      
                      {/* Bank Promo Section */}
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                        <p className="text-sm font-bold text-emerald-900 leading-tight">
                          {bank.offer}
                        </p>
                      </div>

                      {/* EMI Table */}
                      <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-zinc-50/80 border-b border-zinc-100">
                            <tr>
                              <th className="px-5 py-4 font-bold text-zinc-900 uppercase text-[10px] tracking-widest">Plan</th>
                              <th className="px-5 py-4 font-bold text-zinc-900 uppercase text-[10px] tracking-widest text-right">Monthly Installment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {[3, 6, 9, 12, 18, 24].map((months) => {
                              const isNoCost = bank.noCostMonths.includes(months) && cardType === "credit";
                              const monthlyAmount = calculateEMI(numericPrice, rate, months, isNoCost);
                              return (
                                <tr key={months} className={cn("transition-colors", isNoCost ? "bg-orange-50/40 hover:bg-orange-50/60" : "hover:bg-zinc-50/30")}>
                                  <td className="px-5 py-5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-zinc-900 text-base">{months} Months</span>
                                      {isNoCost && (
                                        <Badge className="bg-orange-500 text-white border-none text-[9px] font-black hover:bg-orange-500 px-1.5 py-0.5">
                                          NO COST
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                                      {isNoCost ? "ZERO INTEREST" : `${rate}% p.a. interest`}
                                    </p>
                                  </td>
                                  <td className="px-5 py-5 text-right">
                                    <p className="font-bold text-zinc-900 text-base">{formatCurrency(monthlyAmount)}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium">Total Payable: {formatCurrency(monthlyAmount * months)}</p>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
            
            {/* Footer Disclaimer */}
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <p className="text-[10px] text-zinc-400 italic max-w-[80%] leading-normal">
                *Bank processing fees and GST on interest may apply. No Cost EMI is offered as an upfront discount by the merchant.
              </p>
              <Landmark className="text-zinc-200" size={24} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* B. Visual "No Cost EMI" Hook */}
      <div className="flex items-center gap-2 w-fit bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg border border-amber-100">
        <Zap size={14} fill="currentColor" />
        <span className="text-[11px] font-black uppercase tracking-wider">No Cost EMI Available</span>
      </div>
    </div>
  );
}
