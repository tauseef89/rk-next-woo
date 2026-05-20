"use client";

import { useEffect, useState } from "react";
import { User, Mail, Save, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/useWishlistStore";

// 1. Define the Form State Interface
interface DetailsFormData {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  password?: string;
}

export default function AccountDetailsPage() {
  const { items, setItems } = useWishlistStore(); // ✅ Access Wishlist Store
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<DetailsFormData>({
    first_name: "",
    last_name: "",
    display_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("woo-token");
    const fetchUser = async () => {
      try {
        // Added ?context=edit to ensure we get meta_data from WP API
        const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (res.ok) {
          setUser(data);
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            display_name: data.name || "",
            email: data.email || "",
            password: "",
          });

          // ✅ SYNC LOGIC: Restore wishlist if local is empty
          // WP user meta is typically available in data.meta or data.meta_data depending on API version
          const savedWishlist = data.meta_data?.find((m: any) => m.key === "saved_wishlist");
          if (savedWishlist?.value && items.length === 0) {
            try {
              const productIds = JSON.parse(savedWishlist.value);
              // Map simple IDs to the apiItems structure expected by your store's setItems
              const mappedForStore = productIds.map((id: number) => ({
                ID: id,
                product_id: id
              }));
              setItems(mappedForStore);
            } catch (e) {
              console.error("Wishlist Parse Error:", e);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [items.length, setItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/account/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          ...formData,
          // ✅ SYNC LOGIC: Push latest wishlist items with account update
          wishlist: items.map(i => i.productId) 
        }),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Account details updated successfully." });
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.message || "Failed to update details." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Loading details...</div>;

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account Details</h2>
        <p className="text-muted-foreground text-sm mt-1">Update your personal information and security settings.</p>
      </div>

      {status.message && (
        <div className={cn(
          "p-4 rounded-lg flex items-center gap-3 text-sm font-medium",
          status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {status.type === "success" ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <User className="w-4 h-4" /> Personal Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card p-6 border rounded-xl shadow-sm">
            <InputGroup label="First Name" value={formData.first_name} onChange={(v: string) => setFormData({...formData, first_name: v})} />
            <InputGroup label="Last Name" value={formData.last_name} onChange={(v: string) => setFormData({...formData, last_name: v})} />
            <div className="sm:col-span-2">
              <InputGroup 
                label="Display Name" 
                value={formData.display_name} 
                onChange={(v: string) => setFormData({...formData, display_name: v})} 
                hint="How your name will appear in reviews and account sections."
              />
            </div>
          </div>
        </section>

        {/* Contact & Security Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Mail className="w-4 h-4" /> Account & Security
          </div>
          <div className="space-y-4 bg-card p-6 border rounded-xl shadow-sm">
            <InputGroup label="Email Address" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
            <InputGroup 
              label="New Password" 
              type="password" 
              value={formData.password || ""} 
              onChange={(v: string) => setFormData({...formData, password: v})} 
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
            {updating ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
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
  hint 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  type?: string; 
  hint?: string; 
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow"
      />
      {hint && <p className="text-[10px] text-muted-foreground italic">{hint}</p>}
    </div>
  );
}
