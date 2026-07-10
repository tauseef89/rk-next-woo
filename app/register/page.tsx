"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function RegisterPage() {
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
  const setWishlistItems = useWishlistStore((state) => state.setItems);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const syncGuestWishlistAfterRegister = async () => {
    try {
      const guestWishlistRaw = localStorage.getItem("guest_wishlist");
      const guestWishlist = guestWishlistRaw ? JSON.parse(guestWishlistRaw) : [];

      const guestIds = Array.isArray(guestWishlist)
        ? guestWishlist.map(Number).filter(Boolean)
        : [];

      const serverRes = await fetch("/api/customer/wishlist", {
        method: "GET",
        cache: "no-store",
      });

      const serverData = await serverRes.json().catch(() => null);

      const serverIds = Array.isArray(serverData?.wishlist)
        ? serverData.wishlist.map(Number).filter(Boolean)
        : [];

      const mergedWishlist = Array.from(new Set([...serverIds, ...guestIds]));

      if (mergedWishlist.length > 0) {
        const saveRes = await fetch("/api/customer/wishlist", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wishlist: mergedWishlist,
          }),
        });

        const saveData = await saveRes.json().catch(() => null);

        if (saveRes.ok && saveData?.success) {
          setWishlistItems(saveData.wishlist || mergedWishlist);
          localStorage.removeItem("guest_wishlist");
        } else {
          setWishlistItems(mergedWishlist);
        }
      } else {
        setWishlistItems(serverIds);
      }
    } catch (err) {
      console.error("Guest wishlist sync after register error:", err);
    }
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
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const cleanMessage =
          data?.message?.replace(/<[^>]*>?/gm, "") || "Registration failed.";

        setError(cleanMessage);
        return;
      }

      login(data.user);

      await syncGuestWishlistAfterRegister();

      router.replace("/account");
      router.refresh();
    } catch (err) {
      console.error("Register page error:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <h1 className="mb-8 text-center text-3xl font-bold">Create Account</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <p className="rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1 block font-medium">Full Name</label>
          <input
            name="username"
            type="text"
            required
            placeholder="John Doe"
            autoComplete="name"
            className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-black"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Mobile Number</label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="9876543210"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-black"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            autoComplete="email"
            className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-black"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-black"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <p className="text-sm text-gray-600">
          Create an account to track your orders, save wishlist items, and earn
          reward points.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded bg-black py-3 font-bold text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-black underline">
          Login here
        </Link>
      </p>
    </div>
  );
}