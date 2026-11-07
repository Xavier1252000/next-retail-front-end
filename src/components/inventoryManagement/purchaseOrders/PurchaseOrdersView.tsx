"use client";

import React, { useState } from "react";
import {
  Truck,
  Plus,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  Building,
  Sparkles,
  Search,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "COMPLETED";
  itemsCount: number;
}

export default function PurchaseOrdersView() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [orders] = useState<PurchaseOrder[]>([
    {
      id: "po-001",
      poNumber: "PO-2026-089",
      vendorName: "MedTech Global Pharma Supplies",
      orderDate: "2026-11-04",
      expectedDate: "2026-11-08",
      totalAmount: 64500.0,
      status: "SENT",
      itemsCount: 14,
    },
    {
      id: "po-002",
      poNumber: "PO-2026-088",
      vendorName: "Apex Surgicals & Apparatus Ltd",
      orderDate: "2026-11-01",
      expectedDate: "2026-11-05",
      totalAmount: 112000.0,
      status: "COMPLETED",
      itemsCount: 22,
    },
    {
      id: "po-003",
      poNumber: "PO-2026-090",
      vendorName: "BioCare Disposables India",
      orderDate: "2026-11-06",
      expectedDate: "2026-11-10",
      totalAmount: 28400.0,
      status: "DRAFT",
      itemsCount: 6,
    },
  ]);

  const handleCreatePO = () => {
    setIsModalOpen(false);
    showToast("Draft Purchase Order created successfully!", "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              Purchase Orders & Vendor Receiving (GRN)
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                3-Way Match Protocol
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Automated reorder triggers, supplier PO transmission, goods received notes, and stock ledger updates.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* PO Table */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200">
            Recent Purchase Orders Register
          </h2>
          <span className="text-xs text-slate-400">Showing 3 orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-500 dark:text-neutral-400">
              <tr>
                <th className="p-2.5 rounded-l-lg">PO Number</th>
                <th className="p-2.5">Supplier / Vendor</th>
                <th className="p-2.5">Order Date</th>
                <th className="p-2.5">Expected Delivery</th>
                <th className="p-2.5">Items</th>
                <th className="p-2.5">Total Amount</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/40">
                  <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {po.poNumber}
                  </td>
                  <td className="p-2.5 font-medium text-slate-800 dark:text-neutral-200">
                    {po.vendorName}
                  </td>
                  <td className="p-2.5 text-slate-500">{po.orderDate}</td>
                  <td className="p-2.5 text-slate-500">{po.expectedDate}</td>
                  <td className="p-2.5 text-slate-600 dark:text-neutral-300 font-semibold">{po.itemsCount} SKUs</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-neutral-100 font-mono">
                    ₹{po.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        po.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : po.status === "SENT"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          : "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border-slate-200 dark:border-neutral-700"
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => showToast(`Opening Goods Receipt Note (GRN) for ${po.poNumber}`, "success")}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      Receive Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Retail Standard Benchmark */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Enterprise Retail Purchasing Standards (Lightspeed, ERPNext, SAP Retail)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">3-Way Match Verification</span>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              Compares Purchase Order (ordered quantities) vs Goods Received Note (counted quantities) vs Vendor Invoice (billed amount). Discrepancies generate a debit note automatically.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Moving-Average Cost Revaluation</span>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              When goods are received at a different price than past batches, the system recalculates weighted cost price: ((Old Stock × Old Cost) + (New Stock × New Cost)) / Total Stock.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Automated Reorder Thresholds</span>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              Uses reorder thresholds configured in Catalog & Stock. When current inventory falls below threshold, the system auto-generates a consolidated PO draft for that supplier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
