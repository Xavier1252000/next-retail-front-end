"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { Edit2, Building2, Phone, Mail, CheckCircle, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Store {
  id?: string;
  clientId?: string;
  storeName: string;
  storeType: string; // Retail, Warehouse, Pharmacy, Supermarket
  registrationNo?: string;
  taxIdentificationId?: string;
  taxIdentificationNo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactNo?: string;
  email?: string;
  currency?: string;
  timezone?: string;
  active?: boolean;
}

export default function StoreMasterView() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string>("");

  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Store>({
    storeName: "",
    storeType: "Retail",
    registrationNo: "",
    taxIdentificationId: "GST",
    taxIdentificationNo: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    contactNo: "",
    email: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    active: true,
  });

  const fetchStores = async () => {
    setLoading(true);
    const currentStoreId = Cookies.get("storeId") || "";
    setActiveStoreId(currentStoreId);

    try {
      const { response, status } = await BackendRequest(
        "/api/clientDesk/getAllStores",
        { method: "POST" }
      );

      if (status === 200 && response?.data) {
        setStores(response.data);
      } else if (status === 200 && response?.response?.data) {
        setStores(response.response.data);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error("Failed to load stores:", err);
      showToast("Failed to fetch stores directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openAddModal = () => {
    setEditingStore(null);
    setFormData({
      storeName: "",
      storeType: "Retail",
      registrationNo: "",
      taxIdentificationId: "GST",
      taxIdentificationNo: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      contactNo: "",
      email: "",
      currency: "INR",
      timezone: "Asia/Kolkata",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Store) => {
    setEditingStore(s);
    setFormData({ ...s });
    setIsModalOpen(true);
  };

  const switchActiveStore = (store: Store) => {
    if (!store.id) return;
    Cookies.set("storeId", store.id, { expires: 30, path: "/" });
    setActiveStoreId(store.id);
    showToast(`Switched active store to ${store.storeName}`, "success");
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName.trim()) {
      showToast("Store name is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStore) {
        const { response, status } = await BackendRequest("/api/clientDesk/updateStore", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        if (status === 200) {
          showToast("Store updated successfully!", "success");
          setIsModalOpen(false);
          fetchStores();
        } else {
          showToast(response?.message || "Failed to update store", "error");
        }
      } else {
        // Direct add-store
        const clientId = Cookies.get("userId") || "";
        const payload = {
          ...formData,
          clientId,
          staffIds: [clientId],
        };

        const { response, status } = await BackendRequest("/api/clientDesk/addStore", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (status === 200 || status === 201) {
          showToast("Store created successfully!", "success");
          setIsModalOpen(false);
          fetchStores();
        } else {
          showToast(response?.message || "Failed to create store", "error");
        }
      }
    } catch (err) {
      showToast("Error processing store request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Store>[] = [
    {
      key: "storeName",
      header: "Store & Branch",
      sortable: true,
      accessor: (item) => {
        const isCurrentActive = item.id === activeStoreId;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-slate-900 dark:text-neutral-100">
                {item.storeName}
              </span>
              {isCurrentActive && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">
                  Current Store
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {[item.city, item.state].filter(Boolean).join(", ") || "Location not set"}
            </span>
          </div>
        );
      },
    },
    {
      key: "storeType",
      header: "Type",
      sortable: true,
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          {item.storeType || "Retail"}
        </span>
      ),
    },
    {
      key: "contactNo",
      header: "Contact",
      accessor: (item) => (
        <div className="flex flex-col text-xs space-y-0.5">
          {item.contactNo && (
            <span className="flex items-center gap-1 text-slate-700 dark:text-neutral-300">
              <Phone className="w-3 h-3 text-slate-400" /> {item.contactNo}
            </span>
          )}
          {item.email && (
            <span className="flex items-center gap-1 text-slate-400 dark:text-neutral-500">
              <Mail className="w-3 h-3" /> {item.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "taxIdentificationNo",
      header: "Tax / GSTIN",
      accessor: (item) => (
        <div className="flex flex-col text-xs font-mono">
          <span className="text-slate-800 dark:text-neutral-200">
            {item.taxIdentificationNo || "Unregistered"}
          </span>
          <span className="text-[10px] text-slate-400 font-sans">
            Reg: {item.registrationNo || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "currency",
      header: "Currency",
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
          {item.currency || "INR"}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
            item.active !== false
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
          }`}
        >
          {item.active !== false ? "Active" : "Closed"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => {
        const isCurrentActive = item.id === activeStoreId;
        return (
          <div className="flex items-center gap-2">
            {!isCurrentActive ? (
              <button
                onClick={() => switchActiveStore(item)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-blue-600 hover:text-white transition-colors"
                title="Switch Active Store"
              >
                Set Active
              </button>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Active
              </span>
            )}
            <button
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              title="Edit Store"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <RetailDataTable
        title="Stores & Warehouses Master"
        subtitle="Manage physical outlets, branch stores, distribution hubs, and GST taxation settings"
        data={stores}
        columns={columns}
        loading={loading}
        onRefresh={fetchStores}
        onAddNew={openAddModal}
        addNewLabel="Add Store / Branch"
        searchPlaceholder="Search store by name, city, GSTIN, or phone..."
        searchFields={["storeName", "city", "taxIdentificationNo", "contactNo", "storeType"]}
      />

      {/* Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-900 dark:text-neutral-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold">
                {editingStore ? "Edit Store / Branch Details" : "Register New Store / Branch"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Store / Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="e.g. Surge Retail - Main Branch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Store Type
                  </label>
                  <select
                    value={formData.storeType}
                    onChange={(e) => setFormData({ ...formData, storeType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  >
                    <option value="Retail">Retail Store Outlet</option>
                    <option value="Warehouse">Warehouse / Fulfillment Hub</option>
                    <option value="Pharmacy">Pharmacy / Surgical Store</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Express Outlet">Express Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    GSTIN / Tax Identification No
                  </label>
                  <input
                    type="text"
                    value={formData.taxIdentificationNo || ""}
                    onChange={(e) => setFormData({ ...formData, taxIdentificationNo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none font-mono uppercase"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Business Registration No
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNo || ""}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="CIN / Trade License"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Store Phone / Helpline
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNo || ""}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Store Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="store@domain.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="Building, Road, Area"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency || "INR"}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    PIN / Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || ""}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-98 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Saving..." : editingStore ? "Update Store" : "Register Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
