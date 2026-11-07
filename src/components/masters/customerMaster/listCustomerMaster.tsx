"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { useUserAccess } from "@/context/permissionsContext";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { Edit2, Trash2, Phone, Mail, Building, UserCheck } from "lucide-react";

export interface Customer {
  id?: string;
  storeIds?: string[];
  clientId?: string;
  customerName: string;
  mobileNumber?: string;
  email?: string;
  gstin?: string;
  customerType?: string; // RETAIL, WHOLESALE, B2B, VIP, CORPORATE
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  outstandingBalance?: number;
  creditLimit?: number;
  loyaltyPoints?: number;
  notes?: string;
  active?: boolean;
}

export default function CustomerMasterView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { can } = useUserAccess();

  const canCreate = can("/masters/customerMaster/allCustomers", "CREATE");
  const canUpdate = can("/masters/customerMaster/allCustomers", "UPDATE");
  const canDelete = can("/masters/customerMaster/allCustomers", "DELETE");

  const [formData, setFormData] = useState<Customer>({
    customerName: "",
    mobileNumber: "",
    email: "",
    gstin: "",
    customerType: "RETAIL",
    address: "",
    city: "",
    state: "",
    pincode: "",
    outstandingBalance: 0,
    creditLimit: 50000,
    loyaltyPoints: 0,
    notes: "",
    active: true,
  });

  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    const storeId = Cookies.get("storeId") || "";
    const clientId = Cookies.get("userId") || "";

    try {
      const { response, status } = await BackendRequest(
        "/api/masters/customerMaster/getCustomers",
        {
          method: "POST",
          body: JSON.stringify({ storeId, clientId }),
        }
      );

      if (status === 200 && response?.data) {
        setCustomers(response.data);
      } else if (status === 200 && response?.response?.data) {
        setCustomers(response.response.data);
      } else {
        setCustomers([]);
      }
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      showToast("Failed to load customer directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      customerName: "",
      mobileNumber: "",
      email: "",
      gstin: "",
      customerType: "RETAIL",
      address: "",
      city: "",
      state: "",
      pincode: "",
      outstandingBalance: 0,
      creditLimit: 50000,
      loyaltyPoints: 0,
      notes: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      showToast("Customer name is required", "error");
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
      const endpoint = editingCustomer
        ? "/api/masters/customerMaster/updateCustomer"
        : "/api/masters/customerMaster/addCustomer";

      const { response, status } = await BackendRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (status === 200 || status === 201) {
        showToast(
          editingCustomer ? "Customer updated successfully!" : "Customer registered successfully!",
          "success"
        );
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        showToast(response?.message || "Failed to save customer", "error");
      }
    } catch (err) {
      console.error("Error saving customer:", err);
      showToast("An error occurred while saving", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to deactivate this customer?")) return;

    try {
      const { status } = await BackendRequest("/api/masters/customerMaster/deleteCustomer", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      if (status === 200) {
        showToast("Customer deactivated successfully", "success");
        fetchCustomers();
      } else {
        showToast("Failed to delete customer", "error");
      }
    } catch (err) {
      showToast("Error deleting customer", "error");
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: "customerName",
      header: "Customer Name",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            {item.customerName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            {item.city ? `${item.city}, ${item.state || ""}` : "No address"}
          </span>
        </div>
      ),
    },
    {
      key: "mobileNumber",
      header: "Contact",
      accessor: (item) => (
        <div className="flex flex-col text-xs space-y-0.5">
          {item.mobileNumber && (
            <span className="flex items-center gap-1 text-slate-700 dark:text-neutral-300">
              <Phone className="w-3 h-3 text-slate-400" /> {item.mobileNumber}
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
      key: "customerType",
      header: "Type",
      sortable: true,
      accessor: (item) => {
        const type = item.customerType || "RETAIL";
        const colors: Record<string, string> = {
          RETAIL: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          WHOLESALE: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          B2B: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
          VIP: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
        return (
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[type] || colors.RETAIL}`}>
            {type}
          </span>
        );
      },
    },
    {
      key: "gstin",
      header: "GSTIN",
      accessor: (item) => (
        <span className="font-mono text-xs text-slate-600 dark:text-neutral-400">
          {item.gstin || "-"}
        </span>
      ),
    },
    {
      key: "outstandingBalance",
      header: "Balance / Credit",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col text-xs">
          <span
            className={`font-semibold ${
              (item.outstandingBalance || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            ₹{Number(item.outstandingBalance || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500">
            Limit: ₹{Number(item.creditLimit || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "loyaltyPoints",
      header: "Points",
      sortable: true,
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/50">
          ★ {item.loyaltyPoints || 0}
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
              title="Edit Customer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Deactivate Customer"
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
        title="Customer CRM Directory"
        subtitle="Manage walk-in customers, wholesale accounts, credit limits, and loyalty balances"
        data={customers}
        columns={columns}
        loading={loading}
        onRefresh={fetchCustomers}
        onAddNew={canCreate ? openAddModal : undefined}
        addNewLabel="Add Customer"
        searchPlaceholder="Search customer by name, mobile, email, or GSTIN..."
        searchFields={["customerName", "mobileNumber", "email", "gstin", "city"]}
      />

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-900 dark:text-neutral-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold">
                {editingCustomer ? "Edit Customer Profile" : "Register New Customer"}
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
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber || ""}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="customer@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Customer Classification
                  </label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  >
                    <option value="RETAIL">Retail Consumer</option>
                    <option value="WHOLESALE">Wholesale Buyer</option>
                    <option value="B2B">Corporate / B2B</option>
                    <option value="VIP">VIP Privileged Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    GSTIN (For Tax Billing)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin || ""}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none uppercase font-mono"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit || 0}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Billing / Delivery Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="Shop / House No, Street name"
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
                  {isSubmitting ? "Saving..." : editingCustomer ? "Update Customer" : "Register Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
