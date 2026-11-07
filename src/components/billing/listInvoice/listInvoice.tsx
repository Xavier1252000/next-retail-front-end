"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { useUserAccess } from "@/context/permissionsContext";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import {
  Receipt,
  Printer,
  Calendar,
  CreditCard,
  User,
  Plus,
} from "lucide-react";

export interface InvoiceRecord {
  id: string;
  serialNo: number;
  storeId?: string;
  customerName?: string;
  customerContactNo?: string;
  grossAmount?: number;
  netAmount?: number;
  invoiceTaxAmount?: number;
  invoiceDiscountAmount?: number;
  grandTotal: number;
  paymentStatus?: string;
  deliveryStatus?: string;
  createdOn?: string;
  active?: boolean;
}

export default function AllInvoices() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();
  const { can } = useUserAccess();

  const canCreate = can("/billing/addInvoiceItems", "CREATE");

  const fetchInvoices = async () => {
    setLoading(true);
    const storeId = Cookies.get("storeId");
    if (!storeId) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        storeId_in: [storeId],
        grandTotal_gte: 0,
        paymentStatus_in: ["Pending", "Completed"],
        createdOn_gte: "2025-01-01T00:00:00.000Z",
        skip: 0,
        limit: 500,
      };

      const { response, status } = await BackendRequest(
        "/api/billing/listInvoiceByFilters",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (status === 200) {
        const rawInvoices = response?.response?.data || response?.data || [];
        setInvoices(rawInvoices);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
      showToast("Failed to fetch store invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns: Column<InvoiceRecord>[] = [
    {
      key: "serialNo",
      header: "Invoice #",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col font-mono">
          <span className="font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-blue-500" />
            INV-{String(item.serialNo || item.id?.slice(-6) || "000").padStart(5, "0")}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-sans flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {item.createdOn ? new Date(item.createdOn).toLocaleString() : "Recent"}
          </span>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-neutral-100 flex items-center gap-1 text-xs">
            <User className="w-3 h-3 text-slate-400" />
            {item.customerName || "Walk-in Customer"}
          </span>
          {item.customerContactNo && (
            <span className="text-[11px] text-slate-400 font-mono">
              {item.customerContactNo}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "netAmount",
      header: "Taxable Amt",
      sortable: true,
      accessor: (item) => (
        <span className="text-xs text-slate-600 dark:text-neutral-400">
          ₹{Number(item.netAmount || item.grossAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "invoiceTaxAmount",
      header: "GST Tax",
      accessor: (item) => (
        <span className="text-xs text-slate-500 dark:text-neutral-400">
          ₹{Number(item.invoiceTaxAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "grandTotal",
      header: "Grand Total",
      sortable: true,
      accessor: (item) => (
        <span className="font-bold text-slate-900 dark:text-neutral-100 text-sm">
          ₹{Number(item.grandTotal || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      sortable: true,
      accessor: (item) => {
        const status = item.paymentStatus || "Completed";
        const isCompleted = status.toLowerCase() === "completed" || status.toLowerCase() === "paid";
        return (
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/billing/invoice/${item.id}`)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            title="View & Print Bill (POS Thermal & A4 Tax Invoice)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Bill</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <RetailDataTable
        title="Store Invoices & Billing Register"
        subtitle="Manage POS sales receipts, cash collection, GST tax invoices, and dual print formats"
        data={invoices}
        columns={columns}
        loading={loading}
        onRefresh={fetchInvoices}
        onAddNew={canCreate ? () => router.push("/billing/addInvoiceItems") : undefined}
        addNewLabel="New POS Bill"
        searchPlaceholder="Search invoice #, customer name, or phone..."
        searchFields={["serialNo", "customerName", "customerContactNo"]}
      />
    </div>
  );
}
