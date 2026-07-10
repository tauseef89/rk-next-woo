"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const setWishlistItems = useWishlistStore((state) => state.setItems);

  const syncGuestWishlistAfterLogin = async () => {
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
      console.error("Guest wishlist sync error:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const cleanMessage =
          data.message?.replace(/<[^>]*>?/gm, "") || "Invalid credentials";

        setError(cleanMessage);
        return;
      }

      /**
       * Token is saved in httpOnly cookie by /api/login.
       * Frontend stores only user data in Zustand.
       */
      login(data.user);

      /**
       * Merge guest wishlist with server wishlist after login.
       */
      await syncGuestWishlistAfterLogin();

      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <h1 className="text-3xl font-bold mb-8">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <p className="p-3 bg-red-100 text-red-700 rounded">{error}</p>
        )}

        <div>
          <label className="block mb-1 font-medium">Email Address</label>
          <input
            type="email"
            required
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            required
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm underline font-medium hover:text-gray-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center">
        Don't have an account?{" "}
        <Link href="/register" className="underline font-medium">
          Register here
        </Link>
      </p>
    </div>
  );
}