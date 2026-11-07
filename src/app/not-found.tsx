"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Sparkles,
  Layers,
  ShoppingBag,
  Package,
  Users,
  Store,
  Shield,
  FileText,
  Search,
  ExternalLink,
  Code2,
  CheckCircle2,
} from "lucide-react";

interface FeatureSpec {
  title: string;
  category: string;
  summary: string;
  standardPractice: string;
  dataModel: string[];
  suggestedEndpoints: string[];
}

const RETAIL_KNOWLEDGE_BASE: Record<string, FeatureSpec> = {
  setting: {
    title: "Store Settings & POS Terminal Hardware",
    category: "Store Infrastructure",
    summary: "Configures store identity, branch codes, GSTIN credentials, ESC/POS thermal receipt printers, barcode scanners, and cash drawers.",
    standardPractice: "Enterprise systems (Shopify POS, Lightspeed) provide direct raw LAN socket (Port 9100) or WebHID printer drivers to bypass browser print dialogs, printing 80mm receipts in <300ms.",
    dataModel: ["storeId", "legalEntityName", "gstin", "escPosPrinterIp", "paperWidth (80mm/58mm)", "autoCut", "drawerPulseCode"],
    suggestedEndpoints: ["POST /client-desk/update-store", "GET /client-desk/get-store-by-id", "POST /settings/test-printer"],
  },
  reports: {
    title: "Retail Intelligence & Register Audits",
    category: "Financial & Audits",
    summary: "Live register snapshots (X-Reports), day-end register resets (Z-Reports), payment tender breakdowns, and GST Section 31 tax reporting.",
    standardPractice: "Global retail POS platforms utilize blind cash drawer reconciliations where cashiers tally physical currency without seeing expected totals to eliminate till shrinkage.",
    dataModel: ["shiftId", "cashierId", "openingFloat", "cashSales", "cardSales", "upiSales", "overShortDiscrepancy", "zReportGeneratedOn"],
    suggestedEndpoints: ["POST /billing/list-invoice-by-filters", "GET /billing/get-invoice-filters", "POST /audit/generate-z-report"],
  },
  returns: {
    title: "Reverse Logistics & GST Credit Notes",
    category: "Sales & CRM",
    summary: "Processes invoice returns, restock condition audits (sellable shelf vs damaged quarantine), and issues cash, card, or store credit.",
    standardPractice: "Stores generate legal Credit Notes under GST Section 34, restocking sellable units back to the live ledger while offering store credit vouchers to retain 100% of store revenue.",
    dataModel: ["returnId", "invoiceId", "items[{itemId, quantity, disposition}]", "totalRefund", "refundTender", "reason"],
    suggestedEndpoints: ["POST /refund/create-refund-request", "GET /refund/get-refund-by-id"],
  },
  loyalty: {
    title: "Customer Loyalty & Tier Rewards",
    category: "CRM & Marketing",
    summary: "Manages customer points accumulation, VIP tiers (Silver, Gold, Platinum), and point redemption against POS invoices.",
    standardPractice: "Retailers standardly award 1 loyalty point per ₹100 spent, allowing redemption at POS as an immediate bill deduction (e.g. 1 point = ₹1 discount).",
    dataModel: ["customerId", "tierLevel", "pointsBalance", "lifetimeSpend", "pointsExpiryDate"],
    suggestedEndpoints: ["POST /master/update-customer", "POST /loyalty/redeem-points"],
  },
  purchasing: {
    title: "Purchase Orders & Goods Receiving (GRN)",
    category: "Supply Chain",
    summary: "Automates reordering from supplier masters, generates Goods Received Notes (GRN), and performs 3-way matching against vendor bills.",
    standardPractice: "Recalculates inventory moving-average cost price when incoming batches vary in purchase rate: ((Old Stock × Old Cost) + (New Stock × New Cost)) / Total Stock.",
    dataModel: ["poId", "vendorId", "orderedItems[{itemId, qty, cost}]", "receivedItems", "grnStatus", "debitNoteId"],
    suggestedEndpoints: ["POST /inventory/create-purchase-order", "POST /inventory/receive-grn"],
  },
};

export default function RetailNotFoundOrSpecification() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");
  const [activeSpec, setActiveSpec] = useState<FeatureSpec | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/^\//, "").toLowerCase();
      setCurrentPath(window.location.pathname);

      // Match path with knowledge base
      const matchedKey = Object.keys(RETAIL_KNOWLEDGE_BASE).find((key) =>
        path.includes(key)
      );

      if (matchedKey) {
        setActiveSpec(RETAIL_KNOWLEDGE_BASE[matchedKey]);
      } else {
        // Fallback dynamic specification for any other module
        const readableName = path
          .split("/")
          .filter(Boolean)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ➔ ") || "Enterprise Retail Module";

        setActiveSpec({
          title: `${readableName} Specification`,
          category: "Retail Operations Architecture",
          summary: `Standard architectural blueprint and workflow specifications for ${readableName}.`,
          standardPractice:
            "Modern retail systems (Square, Lightspeed, Shopify POS) implement this module with state persistence, permission gating, offline queuing via IndexedDB, and real-time ledger consistency.",
          dataModel: ["id", "storeId", "createdOn", "modifiedOn", "active", "auditLog"],
          suggestedEndpoints: [`GET /api/${path}`, `POST /api/${path}/create`, `POST /api/${path}/update`],
        });
      }
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Top Navigation & Status Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                  {activeSpec?.title || "Retail Specification & Module Blueprint"}
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Requested URL: <span className="font-mono text-blue-600 dark:text-blue-400">{currentPath}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Specification & Architecture Guide</span>
            </span>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-700/60 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Functional Overview & Module Purpose
          </span>
          <p className="text-xs text-slate-700 dark:text-neutral-200 leading-relaxed font-medium">
            {activeSpec?.summary}
          </p>
        </div>
      </div>

      {/* Industry Standard & Architecture Specification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
              World-Class Retail Standard Practices
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
            {activeSpec?.standardPractice}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Enterprise Benchmarks (Square, Lightspeed, Shopify POS)
            </span>
            <ul className="text-xs text-slate-600 dark:text-neutral-300 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero-latency local caching & offline resilience</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Auditable stock ledger with batch & serial numbers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Strict role-based access control (RBAC)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <Code2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
              Data Model & API Implementation Blueprint
            </h2>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              MongoDB Document Contract
            </span>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-800/60 font-mono text-[11px] text-slate-700 dark:text-neutral-300 space-y-1">
              {activeSpec?.dataModel.map((field, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-blue-500">•</span>
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Backend REST Endpoints
            </span>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-800/60 font-mono text-[11px] text-slate-700 dark:text-neutral-300 space-y-1">
              {activeSpec?.suggestedEndpoints.map((ep, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span>→</span>
                  <span>{ep}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Modules Directory / Quick Jump Links */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Quick Access to Active Live Modules</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Link
            href="/billing/addInvoiceItems"
            className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-neutral-800/40 transition-all group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Quick POS Billing</span>
            <span className="text-[10px] text-slate-400">Fast checkout & thermal slip</span>
          </Link>

          <Link
            href="/inventoryManagement/allItems"
            className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-neutral-800/40 transition-all group cursor-pointer"
          >
            <Package className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Catalog & Stock</span>
            <span className="text-[10px] text-slate-400">Products, prices, stock</span>
          </Link>

          <Link
            href="/masters/customerMaster/allCustomers"
            className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-neutral-800/40 transition-all group cursor-pointer"
          >
            <Users className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Customers CRM</span>
            <span className="text-[10px] text-slate-400">Credit limits & loyalty</span>
          </Link>

          <Link
            href="/all-users"
            className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-neutral-800/40 transition-all group cursor-pointer"
          >
            <Shield className="w-4 h-4 text-rose-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 dark:text-neutral-200 block">Users & Access</span>
            <span className="text-[10px] text-slate-400">RBAC permissions matrix</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
