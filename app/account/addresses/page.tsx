"use client";

import { useEffect, useState } from "react";
import { Home, Truck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/useHasHydrated";

type AddressType = "billing" | "shipping";

type AddressData = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  phone?: string;
};

const emptyAddress: AddressData = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  phone: "",
};

export default function AddressesPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<AddressType | null>(null);
  const [editMode, setEditMode] = useState<AddressType | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasHydrated = useHasHydrated();

  const [formData, setFormData] = useState<{
    billing: AddressData;
    shipping: AddressData;
  }>({
    billing: emptyAddress,
    shipping: emptyAddress,
  });

  useEffect(() => {
    if (!hasHydrated) return;

    async function fetchCustomerData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/customer/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          console.error("Customer API error:", data);
          setError(data.message || "Unable to load address details.");
          return;
        }

        const user = data.user;

        setFormData({
          billing: {
            first_name: user.billing?.first_name || "",
            last_name: user.billing?.last_name || "",
            address_1: user.billing?.address_1 || "",
            address_2: user.billing?.address_2 || "",
            city: user.billing?.city || "",
            state: user.billing?.state || "",
            postcode: user.billing?.postcode || "",
            country: user.billing?.country || "IN",
            phone: user.billing?.phone || user.phone || "",
          },
          shipping: {
            first_name: user.shipping?.first_name || "",
            last_name: user.shipping?.last_name || "",
            address_1: user.shipping?.address_1 || "",
            address_2: user.shipping?.address_2 || "",
            city: user.shipping?.city || "",
            state: user.shipping?.state || "",
            postcode: user.shipping?.postcode || "",
            country: user.shipping?.country || "IN",
            phone: user.shipping?.phone || "",
          },
        });
      } catch (err) {
        console.error("Address load error:", err);
        setError("Something went wrong while loading address records.");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [hasHydrated]);

  const handleSave = async (type: AddressType) => {
    setUpdating(type);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/customer/address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          address: formData[type],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to update address.");
        return;
      }

      setEditMode(null);
      setSuccessMessage(
        type === "billing"
          ? "Billing address updated successfully."
          : "Shipping address updated successfully."
      );
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong while saving address.");
    } finally {
      setUpdating(null);
    }
  };

  if (!hasHydrated || loading) {
    return (
      <div className="py-20 text-center animate-pulse uppercase text-[10px] font-black tracking-widest text-zinc-400">
        Fetching Address Records...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Addresses
        </h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
          Manage your default billing and delivery locations.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AddressCard
          title="Billing Address"
          icon={<Home size={16} />}
          data={formData.billing}
          isEditing={editMode === "billing"}
          onEdit={() => setEditMode("billing")}
          onSave={() => handleSave("billing")}
          onCancel={() => setEditMode(null)}
          onChange={(val: AddressData) =>
            setFormData({ ...formData, billing: val })
          }
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
          onChange={(val: AddressData) =>
            setFormData({ ...formData, shipping: val })
          }
          loading={updating === "shipping"}
        />
      </div>
    </div>
  );
}

function AddressCard({
  title,
  icon,
  data,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  loading,
}: any) {
  return (
    <div
      className={cn(
        "border-2 rounded-[2rem] p-8 transition-all",
        isEditing ? "border-black bg-white" : "border-zinc-100 bg-zinc-50/30"
      )}
    >
      <div className="flex justify-between items-center mb-8 border-b-2 border-zinc-50 pb-6">
        <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
          {icon}
          {title}
        </div>

        {!isEditing && (
          <button
            onClick={onEdit}
            className="text-[10px] font-black uppercase underline hover:text-blue-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <AddressInput
              label="First Name"
              value={data.first_name}
              onChange={(v: string) => onChange({ ...data, first_name: v })}
            />

            <AddressInput
              label="Last Name"
              value={data.last_name}
              onChange={(v: string) => onChange({ ...data, last_name: v })}
            />
          </div>

          <AddressInput
            label="Street Address"
            value={data.address_1}
            onChange={(v: string) => onChange({ ...data, address_1: v })}
          />

          <AddressInput
            label="Apartment, Floor, Landmark"
            value={data.address_2 || ""}
            onChange={(v: string) => onChange({ ...data, address_2: v })}
          />

          <div className="grid grid-cols-2 gap-4">
            <AddressInput
              label="City"
              value={data.city}
              onChange={(v: string) => onChange({ ...data, city: v })}
            />

            <AddressInput
              label="State"
              value={data.state || ""}
              onChange={(v: string) => onChange({ ...data, state: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AddressInput
              label="Postcode"
              value={data.postcode}
              onChange={(v: string) => onChange({ ...data, postcode: v })}
            />

            <AddressInput
              label="Phone"
              value={data.phone || ""}
              onChange={(v: string) => onChange({ ...data, phone: v })}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onSave}
              disabled={loading}
              className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:bg-zinc-300 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Save Changes
            </button>

            <button
              onClick={onCancel}
              className="px-6 py-4 border-2 border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm font-bold text-zinc-600 leading-relaxed">
          {data.first_name || data.address_1 ? (
            <address className="not-italic space-y-1">
              <p className="font-black text-black uppercase text-xs mb-2">
                {data.first_name} {data.last_name}
              </p>

              {data.address_1 && <p>{data.address_1}</p>}
              {data.address_2 && <p>{data.address_2}</p>}

              <p>
                {[data.city, data.state, data.postcode]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {data.phone && <p>Phone: {data.phone}</p>}

              <p className="text-[10px] font-black text-zinc-400 mt-2">
                {data.country || "IN"}
              </p>
            </address>
          ) : (
            <div className="py-4 space-y-2">
              <AlertCircle size={20} className="text-zinc-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Address not configured.
              </p>
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
      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-zinc-50 bg-zinc-50/50 rounded-xl px-4 py-3 text-sm font-bold focus:border-black focus:bg-white outline-none transition-all"
      />
    </div>
  );
}