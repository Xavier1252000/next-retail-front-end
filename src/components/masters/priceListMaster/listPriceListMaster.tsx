"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { useUserAccess } from "@/context/permissionsContext";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { Edit2, Trash2, Tag, Calendar, Layers } from "lucide-react";

export interface PriceList {
  id?: string;
  storeIds?: string[];
  clientId?: string;
  priceListName: string;
  pricingType: string; // PERCENTAGE_DISCOUNT, PERCENTAGE_MARKUP, FIXED
  markupDiscountValue: number;
  customerType: string; // ALL, RETAIL, WHOLESALE, B2B, VIP
  currency: string;
  validFrom?: string;
  validTill?: string;
  description?: string;
  active?: boolean;
}

export default function PriceListMasterView() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const { can } = useUserAccess();

  const canCreate = can("/masters/priceListMaster/allPriceLists", "CREATE");
  const canUpdate = can("/masters/priceListMaster/allPriceLists", "UPDATE");
  const canDelete = can("/masters/priceListMaster/allPriceLists", "DELETE");

  const [formData, setFormData] = useState<PriceList>({
    priceListName: "",
    pricingType: "PERCENTAGE_DISCOUNT",
    markupDiscountValue: 10,
    customerType: "ALL",
    currency: "INR",
    description: "",
    active: true,
  });

  const { showToast } = useToast();

  const fetchPriceLists = async () => {
    setLoading(true);
    const storeId = Cookies.get("storeId") || "";
    const clientId = Cookies.get("userId") || "";

    try {
      const { response, status } = await BackendRequest(
        "/api/masters/priceListMaster/getPriceLists",
        {
          method: "POST",
          body: JSON.stringify({ storeId, clientId }),
        }
      );

      if (status === 200 && response?.data) {
        setPriceLists(response.data);
      } else if (status === 200 && response?.response?.data) {
        setPriceLists(response.response.data);
      } else {
        setPriceLists([]);
      }
    } catch (err) {
      console.error("Failed to load price lists:", err);
      showToast("Failed to fetch price list masters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const openAddModal = () => {
    setEditingPriceList(null);
    setFormData({
      priceListName: "",
      pricingType: "PERCENTAGE_DISCOUNT",
      markupDiscountValue: 10,
      customerType: "ALL",
      currency: "INR",
      description: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PriceList) => {
    setEditingPriceList(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.priceListName.trim()) {
      showToast("Price list name is required", "error");
      return;
    }

    setIsSubmitting(true);
    const storeId = Cookies.get("storeId");
    const payload = {
      ...formData,
      storeIds: storeId ? [storeId] : [],
      clientId: Cookies.get("userId") || "",
    };

    try {
      const endpoint = editingPriceList
        ? "/api/masters/priceListMaster/updatePriceList"
        : "/api/masters/priceListMaster/addPriceList";

      const { response, status } = await BackendRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (status === 200 || status === 201) {
        showToast(
          editingPriceList ? "Price list updated successfully!" : "Price list created successfully!",
          "success"
        );
        setIsModalOpen(false);
        fetchPriceLists();
      } else {
        showToast(response?.message || "Failed to save price list", "error");
      }
    } catch (err) {
      showToast("An error occurred while saving", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to deactivate this price list?")) return;

    try {
      const { status } = await BackendRequest("/api/masters/priceListMaster/deletePriceList", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      if (status === 200) {
        showToast("Price list deactivated successfully", "success");
        fetchPriceLists();
      } else {
        showToast("Failed to delete price list", "error");
      }
    } catch (err) {
      showToast("Error deleting price list", "error");
    }
  };

  const columns: Column<PriceList>[] = [
    {
      key: "priceListName",
      header: "Price List Name",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            {item.priceListName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            {item.description || "General pricing tier"}
          </span>
        </div>
      ),
    },
    {
      key: "pricingType",
      header: "Rule & Rate",
      sortable: true,
      accessor: (item) => {
        const isDiscount = item.pricingType === "PERCENTAGE_DISCOUNT";
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
                isDiscount
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              }`}
            >
              {isDiscount ? `-${item.markupDiscountValue}% Off` : `+${item.markupDiscountValue}% Markup`}
            </span>
            <span className="text-xs text-slate-400">
              {item.pricingType.replace(/_/g, " ")}
            </span>
          </div>
        );
      },
    },
    {
      key: "customerType",
      header: "Customer Tier",
      sortable: true,
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
          {item.customerType || "ALL"}
        </span>
      ),
    },
    {
      key: "validity",
      header: "Validity",
      accessor: (item) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-neutral-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {item.validFrom ? new Date(item.validFrom).toLocaleDateString() : "Always Active"}
          </span>
        </div>
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
          {item.active !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center gap-1.5">
          {canUpdate && (
            <button
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Edit Price List"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Deactivate Price List"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!canUpdate && !canDelete && (
            <span className="text-[11px] text-slate-400">View only</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <RetailDataTable
        title="Price Lists & Tier Pricing"
        subtitle="Configure wholesale price lists, VIP club member markups/discounts, and seasonal rates"
        data={priceLists}
        columns={columns}
        loading={loading}
        onRefresh={fetchPriceLists}
        onAddNew={canCreate ? openAddModal : undefined}
        addNewLabel="Add Price List"
        searchPlaceholder="Search price list name, tier, or customer group..."
        searchFields={["priceListName", "customerType", "pricingType"]}
      />

      {/* Price List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-900 dark:text-neutral-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold">
                {editingPriceList ? "Edit Price List" : "Create New Price List"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  Price List Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.priceListName}
                  onChange={(e) => setFormData({ ...formData, priceListName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="e.g. Wholesale Tier A (10% Off)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Pricing Strategy
                  </label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  >
                    <option value="PERCENTAGE_DISCOUNT">Percentage Discount (-%)</option>
                    <option value="PERCENTAGE_MARKUP">Percentage Markup (+%)</option>
                    <option value="FIXED">Fixed Custom Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Value (% or ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.markupDiscountValue}
                    onChange={(e) => setFormData({ ...formData, markupDiscountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  Target Customer Group
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                >
                  <option value="ALL">All Customers</option>
                  <option value="WHOLESALE">Wholesale Buyers Only</option>
                  <option value="B2B">Corporate / B2B Accounts</option>
                  <option value="VIP">VIP Members Only</option>
                  <option value="RETAIL">Retail Walk-in Customers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  Description / Terms
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  placeholder="Terms or conditions for this price tier..."
                />
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
                  {isSubmitting ? "Saving..." : editingPriceList ? "Update Price List" : "Create Price List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
