"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Gift,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Sparkles,
  LogIn,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

interface SignupPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignupPopup({
  open,
  onOpenChange,
}: SignupPopupProps) {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const closePopup = () => {
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Allow only 10 digits in the mobile field
    const updatedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.username,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success !== false) {
        login({
          id: String(data?.user?.id || data?.user_id || ""),
          email: data?.user?.email || data?.user_email || formData.email,
          name:
            data?.user?.name ||
            data?.user_display_name ||
            formData.username,
        });

        closePopup();
        router.refresh();
        router.push("/shop?welcome=true");
        return;
      }

      const cleanMessage =
        data?.message?.replace(/<[^>]*>?/gm, "") ||
        "Registration failed. Please try again.";

      setError(cleanMessage);
    } catch (err) {
      console.error("Signup popup register error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm transition hover:bg-black hover:text-white"
          aria-label="Close signup popup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative overflow-hidden bg-black px-8 py-8 text-center text-white">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_#facc15,_transparent_40%)]" />

          <div className="relative z-10 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-xl shadow-yellow-400/20">
              <Gift className="h-8 w-8" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                New Customer Offer
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Claim ₹1,000 Discount Coupon
              </h2>

              <p className="mt-2 text-sm font-medium text-white/60">
                Create your account and unlock your first order benefit.
              </p>
            </div>
          </div>
        </div>

        <div className="p-7">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <InputWithIcon
              icon={<User className="h-4 w-4" />}
              name="username"
              type="text"
              placeholder="Full Name"
              value={formData.username}
              onChange={handleChange}
              autoComplete="name"
            />

            <InputWithIcon
              icon={<Phone className="h-4 w-4" />}
              name="phone"
              type="tel"
              placeholder="10-digit Mobile Number"
              value={formData.phone}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
            />

            <InputWithIcon
              icon={<Mail className="h-4 w-4" />}
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <InputWithIcon
              icon={<Lock className="h-4 w-4" />}
              name="password"
              type="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-black py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition hover:bg-zinc-800 disabled:bg-zinc-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Claim My ₹1,000 Discount
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
            <span>Already have an account?</span>

            <Link
              href="/login"
              onClick={closePopup}
              className="inline-flex items-center gap-1 font-bold text-black hover:underline"
            >
              <LogIn className="h-3 w-3" />
              Login
            </Link>
          </div>

          <button
            type="button"
            onClick={closePopup}
            className="mt-4 block w-full text-center text-xs font-medium text-zinc-400 hover:text-black hover:underline"
          >
            Maybe later, I’ll continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}

function InputWithIcon({
  icon,
  name,
  type,
  placeholder,
  value,
  onChange,
  inputMode,
  maxLength,
  autoComplete,
}: {
  icon: React.ReactNode;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
        {icon}
      </div>

      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}