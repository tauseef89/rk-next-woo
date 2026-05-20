"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { syncYithWishlist } from "@/lib/wishlist-sync";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = useAuthStore((state) => state.login); // 2. Get the login action

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Note: This requires the 'JWT Authentication for WP-API' plugin on WordPress
      const res = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: email, password }), // uses 'email' state as username
});

      const data = await res.json();

      if (res.ok) {
  // Update Zustand and local storage
  login(data.user);
  localStorage.setItem("woo-token", data.token);
  
  await syncYithWishlist(data.token);
  router.push("/account");
  router.refresh();
} else {
        // Handle HTML tags sometimes returned by WP errors
        const cleanMessage = data.message?.replace(/<[^>]*>?/gm, '') || "Invalid credentials";
        setError(cleanMessage);
      }
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
        {error && <p className="p-3 bg-red-100 text-red-700 rounded">{error}</p>}
        <div>
          <label className="block mb-1 font-medium">Email or Username</label>
          <input
            type="text"
            required
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          />
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
