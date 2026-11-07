"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { Edit2, Trash2, Percent, CheckCircle, XCircle } from "lucide-react";

export interface TaxMaster {
  id: string;
  storeIds?: string[];
  taxCode: string;
  taxType: string;
  taxPercentage: number | null;
  applicableOn: string;
  applicableCategories?: string[];
  inclusionOnBasePrice: boolean;
  description?: string;
  active: boolean;
}

export default function TaxMasterTable() {
  const [data, setData] = useState<TaxMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchTaxMasters = async () => {
    setLoading(true);
    const cookieStoreId = Cookies.get("storeId");
    if (!cookieStoreId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/masters/taxMaster/taxMasterByStoreId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { storeId: cookieStoreId } }),
      });

      const result = await response.json();
      const taxData = result?.response?.data || result?.data || [];
      setData(taxData);
    } catch (error) {
      console.error("Error fetching tax masters:", error);
      showToast("Failed to fetch tax masters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxMasters();
  }, []);

  const handleDelete = async (taxMasterId: string) => {
    if (!window.confirm("Are you sure you want to delete this tax rule?")) return;

    try {
      const response = await fetch("/api/masters/taxMaster/deleteTaxMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { id: taxMasterId } }),
      });

      if (response.ok) {
        showToast("Tax master deleted successfully", "success");
        fetchTaxMasters();
      } else {
        showToast("Failed to delete tax master", "error");
      }
    } catch (error) {
      showToast("Error deleting tax master", "error");
    }
  };

  const columns: Column<TaxMaster>[] = [
    {
      key: "taxCode",
      header: "Tax Code & Name",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-blue-500" />
            {item.taxCode}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            {item.description || "General Tax Rate"}
          </span>
        </div>
      ),
    },
    {
      key: "taxType",
      header: "Tax Regime",
      sortable: true,
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {item.taxType || "GST"}
        </span>
      ),
    },
    {
      key: "taxPercentage",
      header: "Rate (%)",
      sortable: true,
      accessor: (item) => (
        <span className="font-bold text-slate-900 dark:text-neutral-100 text-sm">
          {item.taxPercentage !== null ? `${item.taxPercentage}%` : "0%"}
        </span>
      ),
    },
    {
      key: "applicableOn",
      header: "Applicable On",
      sortable: true,
      accessor: (item) => (
        <span className="text-xs text-slate-700 dark:text-neutral-300">
          {item.applicableOn || "Item"}
        </span>
      ),
    },
    {
      key: "inclusionOnBasePrice",
      header: "Inclusive Pricing",
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
            item.inclusionOnBasePrice
              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200"
              : "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border-slate-200 dark:border-neutral-700"
          }`}
        >
          {item.inclusionOnBasePrice ? "Tax Included" : "Over Base Price"}
        </span>
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
            onClick={() => router.push(`/masters/taxMaster/updateTaxMaster/${item.id}`)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title="Edit Tax Rate"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Tax Rate"
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
        title="Tax Master (GST & VAT)"
        subtitle="Configure Indian GST slab rates (CGST, SGST, IGST), inclusive tax computation, and HSN rate mappings"
        data={data}
        columns={columns}
        loading={loading}
        onRefresh={fetchTaxMasters}
        onAddNew={() => {
          const storeId = Cookies.get("storeId");
          router.push(`/masters/taxMaster/addTaxMaster?storeId=${storeId || ""}`);
        }}
        addNewLabel="Add Tax Rate"
        searchPlaceholder="Search tax by code, type, or description..."
        searchFields={["taxCode", "taxType", "description"]}
      />
    </div>
  );
}
