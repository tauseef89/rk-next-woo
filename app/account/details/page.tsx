"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Save,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/useWishlistStore";

interface DetailsFormData {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  password?: string;
}

export default function AccountDetailsPage() {
  const { items, setItems } = useWishlistStore();

  const [formData, setFormData] = useState<DetailsFormData>({
    first_name: "",
    last_name: "",
    display_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/customer/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus({
            type: "error",
            message: data.message || "Unable to load account details.",
          });
          return;
        }

        const user = data.user;

        setFormData({
          first_name: user.billing?.first_name || user.name?.split(" ")?.[0] || "",
          last_name: user.billing?.last_name || user.name?.split(" ")?.slice(1).join(" ") || "",
          display_name: user.name || "",
          email: user.email || "",
          password: "",
        });

        if (user.wishlist && Array.isArray(user.wishlist) && items.length === 0) {
          const mappedForStore = user.wishlist.map((id: number) => ({
            ID: id,
            product_id: id,
            productId: id,
          }));

          setItems(mappedForStore);
        }
      } catch (err) {
        console.error("Account details load error:", err);
        setStatus({
          type: "error",
          message: "Something went wrong while loading account details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [items.length, setItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUpdating(true);
    setStatus({
      type: "",
      message: "",
    });

    try {
      const res = await fetch("/api/customer/details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          display_name: formData.display_name,
          email: formData.email,
          password: formData.password,
          wishlist: items.map((item: any) => item.productId || item.product_id || item.ID),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus({
          type: "error",
          message: data.message || "Failed to update details.",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));

      setStatus({
        type: "success",
        message: "Account details updated successfully.",
      });
    } catch (err) {
      console.error("Account details save error:", err);

      setStatus({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-2">
        <Loader2 className="animate-spin w-4 h-4" />
        Loading details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account Details</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Update your personal information and security settings.
        </p>
      </div>

      {status.message && (
        <div
          className={cn(
            "p-4 rounded-lg flex items-center gap-3 text-sm font-medium",
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          )}
        >
          {status.type === "success" ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <User className="w-4 h-4" />
            Personal Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card p-6 border rounded-xl shadow-sm">
            <InputGroup
              label="First Name"
              value={formData.first_name}
              onChange={(v: string) =>
                setFormData({ ...formData, first_name: v })
              }
            />

            <InputGroup
              label="Last Name"
              value={formData.last_name}
              onChange={(v: string) =>
                setFormData({ ...formData, last_name: v })
              }
            />

            <div className="sm:col-span-2">
              <InputGroup
                label="Display Name"
                value={formData.display_name}
                onChange={(v: string) =>
                  setFormData({ ...formData, display_name: v })
                }
                hint="How your name will appear in reviews and account sections."
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Mail className="w-4 h-4" />
            Account & Security
          </div>

          <div className="space-y-4 bg-card p-6 border rounded-xl shadow-sm">
            <InputGroup
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(v: string) =>
                setFormData({ ...formData, email: v })
              }
            />

            <InputGroup
              label="New Password"
              type="password"
              value={formData.password || ""}
              onChange={(v: string) =>
                setFormData({ ...formData, password: v })
              }
              hint="Leave blank to keep your current password."
            />
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            type="submit"
            disabled={updating}
            className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {updating ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>

          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Wishlist will be synced automatically on save.
          </p>
        </div>
      </form>
    </div>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground/70">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow"
      />

      {hint && (
        <p className="text-[10px] text-muted-foreground italic">{hint}</p>
      )}
    </div>
  );
}