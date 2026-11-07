"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { Tag, Trash2, Edit2 } from "lucide-react";

export interface DiscountMaster {
  id: string;
  storeIds?: string[];
  discountName: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  applicableOn: string;
  discountCouponCode?: string;
  active: boolean;
}

export default function DiscountMasterTable() {
  const [discounts, setDiscounts] = useState<DiscountMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchDiscountMasters = async () => {
    setLoading(true);
    const storeId = Cookies.get("storeId");
    try {
      const res = await fetch("/api/masters/discountMaster/getDiscountMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { storeIds: storeId ? [storeId] : [] } }),
      });

      const result = await res.json();
      const records: DiscountMaster[] = result?.response?.data || result?.data || [];
      setDiscounts(records);
    } catch (err) {
      console.error("Failed to load discount masters", err);
      showToast("Failed to fetch discount masters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountMasters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this discount coupon?")) return;

    try {
      const { status } = await BackendRequest(
        "/api/masters/discountMaster/deleteDiscountMaster",
        {
          method: "POST",
          body: JSON.stringify({ id }),
        }
      );

      if (status === 200) {
        showToast("Discount deleted successfully", "success");
        fetchDiscountMasters();
      } else {
        showToast("Failed to delete discount", "error");
      }
    } catch (err) {
      showToast("Error deleting discount", "error");
    }
  };

  const columns: Column<DiscountMaster>[] = [
    {
      key: "discountName",
      header: "Discount & Offer Name",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-500" />
            {item.discountName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            Applicable on: {item.applicableOn || "Item"}
          </span>
        </div>
      ),
    },
    {
      key: "discountCouponCode",
      header: "Coupon Code",
      sortable: true,
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          {item.discountCouponCode?.trim() || "AUTO-APPLIED"}
        </span>
      ),
    },
    {
      key: "value",
      header: "Discount Rate",
      sortable: true,
      accessor: (item) => (
        <div className="font-bold text-slate-900 dark:text-neutral-100 text-sm">
          {item.discountPercentage !== null && item.discountPercentage !== undefined
            ? `${item.discountPercentage}% Off`
            : item.discountAmount !== null
            ? `₹${item.discountAmount} Flat Off`
            : "-"}
        </div>
      ),
    },
    {
      key: "active",
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
            item.active
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Discount"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <RetailDataTable
        title="Discounts & Coupons Master"
        subtitle="Manage promotional discount campaigns, coupon codes, percentage off, and cart voucher rules"
        data={discounts}
        columns={columns}
        loading={loading}
        onRefresh={fetchDiscountMasters}
        onAddNew={() => router.push("/masters/discountMaster/addDiscountMaster")}
        addNewLabel="Add Discount"
        searchPlaceholder="Search discount name or coupon code..."
        searchFields={["discountName", "discountCouponCode", "applicableOn"]}
      />
    </div>
  );
}
