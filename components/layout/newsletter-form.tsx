"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setStatus("loading");

  const form = e.currentTarget;
  const formData = new FormData(form);
  
  const FORM_ID = "133"; // e.g., "358"

  // 1. Ensure the checkbox value is sent correctly. 
  // CF7 REST API often requires brackets [] in the name for checkboxes.
  const consentChecked = form.querySelector<HTMLInputElement>('#newsletter-consent')?.checked;
  if (consentChecked) {
    // We manually set it to ensure it matches the [checkbox* checkbox-281] tag
    formData.set("checkbox-281[]", "By selecting this option you agree with our Privacy policy and Terms & Conditions");
  }

  // 2. Add the required internal unit tag
  formData.append("_wpcf7_unit_tag", `wpcf7-f${FORM_ID}-o1`);

  const API_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    // 3. Log the full response to see EXACTLY which field is failing
    console.log("CF7 Full Response:", result);

    if (result.status === "mail_sent") {
      setStatus("success");
      form.reset();
    } else {
      // If there are validation errors, they are listed in result.invalid_fields
      if (result.invalid_fields) {
        result.invalid_fields.forEach((field: any) => {
          console.error(`Validation error in ${field.name}: ${field.message}`);
        });
      }
      setStatus("error");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    setStatus("error");
  }
}


  return (
    <div className="flex flex-col gap-4 max-w-md">
      <h5 className=" text-lg tracking-tight text-white">
        Stay in touch with us, get product updates, offers, discounts directly to your inbox
      </h5>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Horizontal Input + Button Group (Vijay Sales Style) */}
        <div className="flex flex-row overflow-hidden border border-gray-600 rounded focus-within:ring-2 focus-within:ring-orange-500 text-white">
          <input
            type="email"
            name="your-email" 
            placeholder="Enter Email Address"
            required
            autoComplete="email"
            className="flex-1 px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#021686] hover:bg-[#d95d18] text-white px-6 py-3 text-sm font-bold transition-colors disabled:bg-gray-400"
          >
            {status === "loading" ? "..." : "SUBSCRIBE"}
          </button>
        </div>

        {/* Compliance Checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="checkbox-281[]" 
            id="newsletter-consent"
            required
            className="mt-1 h-4 w-4 accent-orange-600 cursor-pointer"
          />
          <label htmlFor="newsletter-consent" className="text-[11px] text-gray-500 leading-tight">
            By selecting this option you agree with our <a href="/privacy" className="underline hover:text-orange-600">Privacy policy</a> and <a href="/terms" className="underline hover:text-orange-600">Terms & Conditions</a>
          </label>
        </div>

        {/* Feedback Messages */}
        {status === "success" && (
          <p className="text-green-600 text-xs font-medium">Thank you! You have been subscribed.</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-xs font-medium">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}
