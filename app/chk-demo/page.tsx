"use client";

import { useState } from "react";

export default function PineLabsCheckoutPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    amount: "",
  });

  const [responseData, setResponseData] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async () => {
  try {
    const res = await fetch(
      "/api/pinelabs/create-payment",
      {
        method: "POST",
      }
    );

    const result = await res.json();

    console.log(result);

    if (result?.data?.order_token) {
      window.location.href =
        `https://pluraluat.v2.pinepg.in/payment/v1/order/${result.data.order_token}`;
    }
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          Pine Labs Payment Test
        </h1>

        <p className="text-gray-500 mb-8">
          Next.js + Pine Labs UAT Integration
        </p>

        <div className="space-y-5">
          {/* NAME */}
          <div>
            <label className="block mb-2 font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* MOBILE */}
          <div>
            <label className="block mb-2 font-medium">
              Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              placeholder="9999999999"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* AMOUNT */}
          <div>
            <label className="block mb-2 font-medium">
              Amount (INR)
            </label>

            <input
              type="number"
              name="amount"
              placeholder="1"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {loading
              ? "Processing..."
              : "Pay with Pine Labs"}
          </button>
        </div>

        {/* TEST CARD */}
        <div className="mt-10 bg-gray-50 border rounded-xl p-5">
          <h2 className="font-bold mb-3">
            UAT Test Card
          </h2>

          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <strong>Card:</strong>{" "}
              4012001037141112
            </p>

            <p>
              <strong>CVV:</strong> 123
            </p>

            <p>
              <strong>Expiry:</strong> Any future date
            </p>
          </div>
        </div>

        {/* RESPONSE */}
        {responseData && (
          <div className="mt-10">
            <h2 className="font-bold mb-3">
              API Response
            </h2>

            <pre className="bg-black text-green-400 text-sm p-5 rounded-xl overflow-auto">
              {JSON.stringify(
                responseData,
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}