"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignupPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hideSignupPopup");
    const token = localStorage.getItem("woo-token");
    // Only show if not logged in and hasn't dismissed popup
    if (!hasSeen && !token) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem("hideSignupPopup", "true");
  };

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
        if (data.token) {
          localStorage.setItem("woo-token", data.token);
          login({
            id: data.user_id || "",
            email: data.user_email || formData.email,
            name: data.user_display_name || formData.username,
          });
        }
        closePopup();
        router.refresh();
        // Redirect to a "Welcome" or Shop page
        router.push("/shop?welcome=true"); 
      } else {
        const cleanMessage = data.message?.replace(/<[^>]*>?/gm, "") || "Registration failed.";
        setError(cleanMessage);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Discount Header */}
        <div className="bg-yellow-400 py-3 text-center text-sm font-bold uppercase tracking-tight text-black">
          🎁 Claim Your 1,000 Signup Discount
        </div>

        <button onClick={closePopup} className="absolute right-4 top-12 text-gray-400 hover:text-black text-xl">✕</button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Join & Save</h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Create an account to unlock your 1,000 discount on your first order.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="p-3 bg-red-100 text-red-700 rounded text-xs">{error}</p>}
            
            <input
              name="username"
              type="text"
              required
              placeholder="Username"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
              value={formData.username}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-lg"
            >
              {loading ? "Creating Account..." : "Claim My 1,000 Discount"}
            </button>
          </form>

          <button onClick={closePopup} className="mt-4 block w-full text-center text-xs text-gray-400 hover:underline">
            Maybe later, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}
