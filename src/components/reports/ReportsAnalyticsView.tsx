"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Banknote,
  CreditCard,
  QrCode,
  DollarSign,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Printer,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function ReportsAnalyticsView() {
  const { showToast } = useToast();
  const [reportPeriod, setReportPeriod] = useState<"TODAY" | "THIS_WEEK" | "THIS_MONTH">("TODAY");

  const handlePrintXReport = () => {
    window.print();
    showToast("Dispatching X-Report to thermal receipt printer...", "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              Retail Intelligence & Register Audits
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                X/Z Report Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Live sales summaries, payment tender reconciliations, ABC inventory turn analysis, and tax audit reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
            {(["TODAY", "THIS_WEEK", "THIS_MONTH"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setReportPeriod(period)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  reportPeriod === period
                    ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-neutral-400 hover:text-slate-900"
                }`}
              >
                {period.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrintXReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Register Reading (X-Out)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Gross Sales</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100">₹48,250.00</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs yesterday
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Invoices Generated</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100">38 Bills</div>
          <span className="text-[11px] text-slate-500 font-medium">Avg Order Value: ₹1,269.73</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">GST Tax Collected</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹6,420.50</div>
          <span className="text-[11px] text-slate-500 font-medium">CGST: ₹3,210.25 • SGST: ₹3,210.25</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Gross Profit Margin</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹14,920.00</div>
          <span className="text-[11px] text-slate-500 font-medium">30.9% Average Markup</span>
        </div>
      </div>

      {/* Tender Breakdown & Register Reconciliation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-500" />
              <span>Payment Tender Breakdown (Till Reconciliation)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">38 Transactions</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-700/60">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-neutral-200 block">Cash Drawer Collection</span>
                  <span className="text-[10px] text-slate-400">18 transactions</span>
                </div>
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-neutral-100 font-mono">₹22,400.00</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-700/60">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-neutral-200 block">Credit / Debit Card EDC Terminal</span>
                  <span className="text-[10px] text-slate-400">12 transactions</span>
                </div>
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-neutral-100 font-mono">₹16,850.00</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-700/60">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-neutral-200 block">UPI QR Code (Instant Settlement)</span>
                  <span className="text-[10px] text-slate-400">8 transactions</span>
                </div>
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-neutral-100 font-mono">₹9,000.00</span>
            </div>
          </div>
        </div>

        {/* Inventory Velocity (ABC Classification) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <span>Inventory Velocity (ABC Turn Analysis)</span>
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
              Fast Moving
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-neutral-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-neutral-200 block">Disposable Syringe 5ml (Box)</span>
                <span className="text-[10px] text-slate-400">Class A (Top 10% Revenue) • 24 units sold today</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹8,400.00</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-neutral-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-neutral-200 block">Digital Blood Pressure Monitor</span>
                <span className="text-[10px] text-slate-400">Class A (High Margin) • 4 units sold today</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹7,200.00</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-neutral-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-neutral-200 block">Sterile Latex Examination Gloves (M)</span>
                <span className="text-[10px] text-slate-400">Class B • 10 units sold today</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹5,500.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Standard Reference */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Global Retail Reporting Standards (X-Report vs Z-Report)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">X-Report (Interim Reading)</span>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              A non-destructive snapshot of the register sales, cash collections, and tax liability taken mid-shift without resetting transaction serial numbers or opening float counters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Z-Report (End-of-Day Close)</span>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              The official daily closing audit. Locks the till, requires blind currency tallying, outputs total tender discrepancies, prints a final legal audit receipt, and resets daily registers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">GSTR-1 Tax Audit Readiness</span>
            <p className="text-slate-500 dark:text-neutral-400 leading-relaxed text-[11px]">
              Formats tax data directly by HSN code and state jurisdiction, enabling 1-click export to tally/CSV for GST portal e-filing without manual accountant recalculation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
