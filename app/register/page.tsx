"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore"; // Import your store

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  // Get the login action from Zustand
  const login = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. If your API returns user info and a token, log them in immediately
        if (data.token) {
          localStorage.setItem("woo-token", data.token);
          login({
            id: data.user_id || "",
            email: data.user_email || formData.email,
            name: data.user_display_name || formData.username,
          });
          router.push("/account");
        } else {
          // 2. Otherwise, redirect to login with a success message
          router.push("/login?registered=success");
        }
        router.refresh();
      } else {
        // Clean up WordPress HTML error tags if present
        const cleanMessage = data.message?.replace(/<[^>]*>?/gm, '') || "Registration failed.";
        setError(cleanMessage);
      }
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
        {error && <p className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</p>}
        
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            name="username"
            type="text"
            required
            placeholder="johndoe"
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
