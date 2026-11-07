"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { useUserAccess } from "@/context/permissionsContext";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import {
  Package,
  Edit2,
  Eye,
  Sliders,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export interface ItemRecord {
  id: string;
  storeId?: string;
  itemName: string;
  skuCode?: number;
  barcode?: string;
  costPrice?: number;
  profitToGainInPercentage?: number;
  baseSellingPrice?: number;
  profitMargin?: number;
  markupPercentage?: number;
  totalTaxPrice?: number;
  totalDiscountPrice?: number;
  finalPrice?: number;
  itemStock?: number;
  stockThreshold?: number;
  stockUnit?: string;
  brand?: string;
  active?: boolean;
}

export default function AllItems() {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();
  const { can } = useUserAccess();

  const canCreate = can("/inventoryManagement/allItems", "CREATE");
  const canUpdate = can("/inventoryManagement/allItems", "UPDATE");
  const canDelete = can("/inventoryManagement/allItems", "DELETE");

  const fetchItems = async () => {
    setLoading(true);
    const storeId = Cookies.get("storeId");
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      const { response, status } = await BackendRequest(
        "/api/inventoryManagement/allItems",
        {
          method: "POST",
          body: JSON.stringify({
            data: {
              storeId,
              index: 0,
              itemPerIndex: 500, // Load catalog for fast client-side sorting & filtering
            },
          }),
        }
      );

      if (status === 200) {
        const rawItems = response?.response?.data?.items || response?.data?.items || [];
        setItems(rawItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load inventory items:", err);
      showToast("Failed to fetch product catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleStatus = async (item: ItemRecord) => {
    try {
      const { response, status } = await BackendRequest(
        "/api/inventoryManagement/toggleItemStatus",
        {
          method: "POST",
          body: JSON.stringify({ itemId: item.id }),
        }
      );

      if (status === 200 || response?.statusCode === 200) {
        showToast(
          item.active !== false ? "Item deactivated" : "Item activated",
          "success"
        );
        fetchItems();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      showToast("Error updating item status", "error");
    }
  };

  const columns: Column<ItemRecord>[] = [
    {
      key: "itemName",
      header: "Product & SKU",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-500" />
            {item.itemName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
            SKU: {item.skuCode ?? "-"} {item.barcode ? `• Barcode: ${item.barcode}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "itemStock",
      header: "Stock Level",
      sortable: true,
      accessor: (item) => {
        const stock = item.itemStock ?? 0;
        const threshold = item.stockThreshold ?? 5;
        const isOut = stock <= 0;
        const isLow = stock > 0 && stock <= threshold;

        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-neutral-100">
              {stock} {item.stockUnit || "units"}
            </span>
            {isOut && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                Out
              </span>
            )}
            {isLow && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Low
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "costPrice",
      header: "Cost Price",
      sortable: true,
      accessor: (item) => (
        <span className="text-xs text-slate-600 dark:text-neutral-400">
          ₹{Number(item.costPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "profitMargin",
      header: "Profit Margin",
      sortable: true,
      accessor: (item) => {
        const margin = Number(item.profitMargin || 0);
        return (
          <span
            className={`text-xs font-semibold ${
              margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            ₹{margin.toFixed(2)} ({Number(item.profitToGainInPercentage || 0)}%)
          </span>
        );
      },
    },
    {
      key: "totalTaxPrice",
      header: "Tax (₹)",
      accessor: (item) => (
        <span className="text-xs text-slate-500 dark:text-neutral-400">
          ₹{Number(item.totalTaxPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "finalPrice",
      header: "Final Price (MRP)",
      sortable: true,
      accessor: (item) => (
        <span className="font-bold text-slate-900 dark:text-neutral-100 text-sm">
          ₹{Number(item.finalPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      accessor: (item) =>
        canUpdate ? (
          <button
            onClick={() => handleToggleStatus(item)}
            className={`px-2 py-0.5 text-xs font-semibold rounded-full border cursor-pointer transition-colors ${
              item.active !== false
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100"
            }`}
            title="Click to toggle active status"
          >
            {item.active !== false ? "Active" : "Inactive"}
          </button>
        ) : (
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
              onClick={() => router.push(`/inventoryManagement/editItem/${item.id}`)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Edit Item"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => router.push(`/inventoryManagement/itemDetails/${item.id}`)}
            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <RetailDataTable
        title="Products & Inventory Catalog"
        subtitle="Full item catalog with live stock counts, profit margins, GST taxes, and price calculations"
        data={items}
        columns={columns}
        loading={loading}
        onRefresh={fetchItems}
        onAddNew={canCreate ? () => router.push("/inventoryManagement/addItem") : undefined}
        addNewLabel="Add Product"
        searchPlaceholder="Search product by name, SKU, or barcode..."
        searchFields={["itemName", "skuCode", "barcode", "brand"]}
      />
    </div>
  );
}
