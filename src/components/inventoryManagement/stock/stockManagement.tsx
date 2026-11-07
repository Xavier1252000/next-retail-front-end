"use client";

import React, { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { useUserAccess } from "@/context/permissionsContext";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import {
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Sliders,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";

export interface StockItem {
  id: string;
  storeId?: string;
  itemName: string;
  skuCode?: number;
  barcode?: string;
  costPrice?: number;
  baseSellingPrice?: number;
  finalPrice?: number;
  itemStock?: number;
  stockThreshold?: number;
  stockUnit?: string;
  brand?: string;
  active?: boolean;
}

export default function StockManagementView() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const { can } = useUserAccess();

  const canUpdate = can("/inventoryManagement/stock", "UPDATE");

  // Stock Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"ADD_STOCK" | "DAMAGE_WRITEOFF" | "AUDIT_CORRECTION">("ADD_STOCK");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchStockItems = async () => {
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
              itemPerIndex: 500, // Load comprehensive store catalog
            },
          }),
        }
      );

      if (status === 200) {
        const rawItems = response?.response?.data?.items || response?.data?.items || [];
        setItems(rawItems);
      }
    } catch (err) {
      console.error("Failed to load inventory stock:", err);
      showToast("Failed to fetch inventory stock", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, []);

  // Inventory KPIs
  const kpis = useMemo(() => {
    let totalStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    items.forEach((item) => {
      const stock = item.itemStock || 0;
      const threshold = item.stockThreshold || 5;
      const cost = item.costPrice || 0;

      totalStockCount += stock;
      totalValuation += stock * cost;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        lowStockCount++;
      }
    });

    return {
      totalItems: items.length,
      totalStockCount,
      lowStockCount,
      outOfStockCount,
      totalValuation,
    };
  }, [items]);

  // Filtered Items based on Status Button
  const filteredItems = useMemo(() => {
    if (statusFilter === "LOW_STOCK") {
      return items.filter((item) => (item.itemStock || 0) <= (item.stockThreshold || 5) && (item.itemStock || 0) > 0);
    }
    if (statusFilter === "OUT_OF_STOCK") {
      return items.filter((item) => (item.itemStock || 0) <= 0);
    }
    return items;
  }, [items, statusFilter]);

  const openAdjustModal = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustmentType("ADD_STOCK");
    setAdjustQuantity(10);
    setAdjustReason("Purchase stock arrival");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (adjustQuantity <= 0 && adjustmentType !== "AUDIT_CORRECTION") {
      showToast("Quantity must be greater than zero", "error");
      return;
    }

    setIsSubmitting(true);
    const storeId = Cookies.get("storeId");
    const adjustedBy = Cookies.get("name") || "Staff";

    try {
      const { response, status } = await BackendRequest(
        "/api/inventoryManagement/adjustStock",
        {
          method: "POST",
          body: JSON.stringify({
            storeId,
            itemId: selectedItem.id,
            quantity: adjustQuantity,
            adjustmentType,
            reason: adjustReason,
            adjustedBy,
          }),
        }
      );

      if (status === 200 || response?.statusCode === 200) {
        showToast(`Stock updated successfully for ${selectedItem.itemName}`, "success");
        setIsAdjustModalOpen(false);
        fetchStockItems();
      } else {
        showToast(response?.message || "Failed to adjust stock", "error");
      }
    } catch (err) {
      showToast("Error updating stock", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<StockItem>[] = [
    {
      key: "itemName",
      header: "Item & SKU",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-500" />
            {item.itemName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
            SKU: {item.skuCode || "-"} {item.barcode ? `• Barcode: ${item.barcode}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "itemStock",
      header: "Current Stock",
      sortable: true,
      accessor: (item) => {
        const stock = item.itemStock || 0;
        const threshold = item.stockThreshold || 5;
        const isOut = stock <= 0;
        const isLow = stock > 0 && stock <= threshold;

        return (
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-neutral-100">
              {stock}
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              {item.stockUnit || "units"}
            </span>
            {isOut && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                Out of Stock
              </span>
            )}
            {isLow && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Low Stock
              </span>
            )}
            {!isOut && !isLow && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                In Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "stockThreshold",
      header: "Reorder Threshold",
      sortable: true,
      accessor: (item) => (
        <span className="text-xs text-slate-600 dark:text-neutral-400">
          Min {item.stockThreshold || 5} units
        </span>
      ),
    },
    {
      key: "costPrice",
      header: "Cost & Valuation",
      sortable: true,
      accessor: (item) => {
        const stock = item.itemStock || 0;
        const cost = item.costPrice || 0;
        return (
          <div className="flex flex-col text-xs">
            <span className="text-slate-800 dark:text-neutral-200 font-medium">
              Cost: ₹{cost.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400">
              Value: ₹{(stock * cost).toLocaleString()}
            </span>
          </div>
        );
      },
    },
    {
      key: "finalPrice",
      header: "Retail Price",
      sortable: true,
      accessor: (item) => (
        <span className="font-semibold text-slate-900 dark:text-neutral-100">
          ₹{Number(item.finalPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      accessor: (item) =>
        canUpdate ? (
          <button
            onClick={() => openAdjustModal(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            title="Adjust Stock Count"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Stock</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium px-2 py-1">
            Read Only
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Inventory KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-semibold uppercase">
            <span>Total SKUs</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mt-2">
            {kpis.totalItems}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {kpis.totalStockCount} units in stock
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-2">
            {kpis.lowStockCount}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Reorder threshold reached
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold uppercase">
            <span>Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-2">
            {kpis.outOfStockCount}
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
            Immediate replenishment required
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase">
            <span>Stock Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-2">
            ₹{Math.round(kpis.totalValuation).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Based on purchase cost
          </div>
        </div>
      </div>

      {/* Main Stock Data Table */}
      <RetailDataTable
        title="Stock & Inventory Control"
        subtitle="Live tracking of warehouse stock, low-stock reorder points, and physical audit adjustments"
        data={filteredItems}
        columns={columns}
        loading={loading}
        onRefresh={fetchStockItems}
        searchPlaceholder="Search product by name, SKU, or barcode..."
        searchFields={["itemName", "skuCode", "barcode", "brand"]}
        filterComponent={
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-800 p-1 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-medium">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === "ALL"
                  ? "bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-neutral-400"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setStatusFilter("LOW_STOCK")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === "LOW_STOCK"
                  ? "bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-neutral-400"
              }`}
            >
              Low Stock ({kpis.lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter("OUT_OF_STOCK")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === "OUT_OF_STOCK"
                  ? "bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-neutral-400"
              }`}
            >
              Out of Stock ({kpis.outOfStockCount})
            </button>
          </div>
        }
      />

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900 dark:text-neutral-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold">Adjust Inventory Stock</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {selectedItem.itemName} (SKU: {selectedItem.skuCode})
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 text-sm">
                <span className="text-slate-500 dark:text-neutral-400">Current Stock:</span>
                <span className="font-bold text-slate-900 dark:text-neutral-100 text-base">
                  {selectedItem.itemStock || 0} {selectedItem.stockUnit || "units"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("ADD_STOCK")}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      adjustmentType === "ADD_STOCK"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-500"
                        : "bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Receive (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType("DAMAGE_WRITEOFF")}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      adjustmentType === "DAMAGE_WRITEOFF"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-500"
                        : "bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400"
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Write-off (-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType("AUDIT_CORRECTION")}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      adjustmentType === "AUDIT_CORRECTION"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-500"
                        : "bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Audit Set (=)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  {adjustmentType === "AUDIT_CORRECTION" ? "New Exact Stock Count" : "Quantity to Adjust"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                  Reason / Audit Memo
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  placeholder="e.g. Stock shipment received, expiry discard, physical audit"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-98 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Updating..." : "Save Stock Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
