"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Unable to send reset link.");
        return;
      }

      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <h1 className="text-3xl font-bold mb-3">Forgot Password</h1>

      <p className="text-gray-600 mb-8">
        Enter your registered email address. We will send you a password reset
        link.
      </p>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        {message && (
          <p className="p-3 bg-green-100 text-green-700 rounded">{message}</p>
        )}

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
            placeholder="Enter your registered email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center">
        Remember password?{" "}
        <Link href="/login" className="underline font-medium">
          Back to Login
        </Link>
      </p>
    </div>
  );
}