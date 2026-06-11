"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const setWishlistItems = useWishlistStore((state) => state.setItems);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const cleanMessage =
          data.message?.replace(/<[^>]*>?/gm, "") || "Registration failed.";

        setError(cleanMessage);
        return;
      }

      /**
       * Token is saved by /api/register in httpOnly cookie.
       * Frontend only stores user data.
       */
      login(data.user);

      /**
       * Sync guest wishlist after account creation.
       */
      await syncGuestWishlistAfterRegister();

      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Account</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <p className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </p>
        )}

        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            name="username"
            type="text"
            required
            placeholder="John Doe"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black outline-none"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <p className="text-sm text-gray-600">
          Create an account to track your orders, save wishlist items, and earn reward points.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 disabled:bg-gray-400 mt-4 transition-colors"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="underline font-medium text-black">
          Login here
        </Link>
      </p>
    </div>
  );
}