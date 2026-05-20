"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Home, Truck, Loader2, CheckCircle2, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/useHasHydrated";

export default function AddressesPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"billing" | "shipping" | null>(null);
  const hasHydrated = useHasHydrated();
  const [userId, setUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState<any>({
    billing: { first_name: "", last_name: "", address_1: "", city: "", postcode: "", country: "IN" },
    shipping: { first_name: "", last_name: "", address_1: "", city: "", postcode: "", country: "IN" },
  });

  useEffect(() => {
    const token = Cookies.get("woo-token");
    if (!token) {
    setLoading(false);
    return;
  }

    async function fetchCustomerData() {
  try {
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Safety check: Ensure WordPress actually returned a valid user
    if (!userRes.ok) throw new Error("Could not verify user session.");
    const userData = await userRes.json();
    
    if (userData.id) {
      setUserId(userData.id);
      
      const customerRes = await fetch(`/api/account/customer?userId=${userData.id}`);
      
      // If customerRes is NOT ok, it might be an HTML error page
      if (!customerRes.ok) {
        const errorText = await customerRes.text(); // Get raw text to debug
        console.error("API Error Body:", errorText);
        throw new Error("Customer API failed.");
      }
      
      const customer = await customerRes.json();
      if (customer) {
        setFormData({
          billing: customer.billing,
          shipping: customer.shipping
        });
      }
    }
  } catch (err) {
    console.error("Address load error:", err);
    setLoading(false); // Stop the spinner even if there is an error
  } finally {
    setLoading(false);
  }
}

    fetchCustomerData();
  }, [hasHydrated]);

  const handleSave = async (type: "billing" | "shipping") => {
    setUpdating(type);
    try {
      const res = await fetch("/api/account/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, [type]: formData[type] }),
      });
      if (res.ok) setEditMode(null);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (!hasHydrated || loading) return (
    <div className="py-20 text-center animate-pulse uppercase text-[10px] font-black tracking-widest text-zinc-400">
      Fetching Address Records...
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Addresses</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
          Manage your default billing and delivery locations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AddressCard 
          title="Billing Address"
          icon={<Home size={16} />}
          data={formData.billing}
          isEditing={editMode === "billing"}
          onEdit={() => setEditMode("billing")}
          onSave={() => handleSave("billing")}
          onCancel={() => setEditMode(null)}
          onChange={(val: any) => setFormData({...formData, billing: val})}
          loading={updating === "billing"}
        />

        <AddressCard 
          title="Shipping Address"
          icon={<Truck size={16} />}
          data={formData.shipping}
          isEditing={editMode === "shipping"}
          onEdit={() => setEditMode("shipping")}
          onSave={() => handleSave("shipping")}
          onCancel={() => setEditMode(null)}
          onChange={(val: any) => setFormData({...formData, shipping: val})}
          loading={updating === "shipping"}
        />
      </div>
    </div>
  );
}

function AddressCard({ title, icon, data, isEditing, onEdit, onSave, onCancel, onChange, loading }: any) {
  return (
    <div className={cn(
      "border-2 rounded-[2rem] p-8 transition-all",
      isEditing ? "border-black bg-white" : "border-zinc-100 bg-zinc-50/30"
    )}>
      <div className="flex justify-between items-center mb-8 border-b-2 border-zinc-50 pb-6">
        <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
          {icon}
          {title}
        </div>
        {!isEditing && (
          <button onClick={onEdit} className="text-[10px] font-black uppercase underline hover:text-blue-600 transition-colors">
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <AddressInput label="First Name" value={data.first_name} onChange={(v: string) => onChange({...data, first_name: v})} />
            <AddressInput label="Last Name" value={data.last_name} onChange={(v: string) => onChange({...data, last_name: v})} />
          </div>
          <AddressInput label="Street Address" value={data.address_1} onChange={(v: string) => onChange({...data, address_1: v})} />
          <div className="grid grid-cols-2 gap-4">
            <AddressInput label="City" value={data.city} onChange={(v: string) => onChange({...data, city: v})} />
            <AddressInput label="Postcode" value={data.postcode} onChange={(v: string) => onChange({...data, postcode: v})} />
          </div>
          
          <div className="flex gap-3 pt-6">
            <button 
              onClick={onSave} 
              disabled={loading}
              className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:bg-zinc-300 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={14} />}
              Save Changes
            </button>
            <button onClick={onCancel} className="px-6 py-4 border-2 border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm font-bold text-zinc-600 leading-relaxed">
          {data.first_name ? (
            <address className="not-italic space-y-1">
              <p className="font-black text-black uppercase text-xs mb-2">{data.first_name} {data.last_name}</p>
              <p>{data.address_1}</p>
              <p>{data.city}, {data.postcode}</p>
              <p className="text-[10px] font-black text-zinc-400 mt-2">{data.country}</p>
            </address>
          ) : (
            <div className="py-4 space-y-2">
              <AlertCircle size={20} className="text-zinc-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address not configured.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddressInput({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full border-2 border-zinc-50 bg-zinc-50/50 rounded-xl px-4 py-3 text-sm font-bold focus:border-black focus:bg-white outline-none transition-all"
      />
    </div>
  );
}
