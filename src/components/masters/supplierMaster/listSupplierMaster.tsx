"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { useUserAccess } from "@/context/permissionsContext";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { Edit2, Trash2, Truck, Phone, Mail, CreditCard } from "lucide-react";

export interface Supplier {
  id?: string;
  storeIds?: string[];
  clientId?: string;
  supplierName: string;
  companyName?: string;
  contactPerson?: string;
  phoneNumber?: string;
  alternateNumber?: string;
  email?: string;
  gstin?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermsDays?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  notes?: string;
  active?: boolean;
}

export default function SupplierMasterView() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { can } = useUserAccess();

  const canCreate = can("/masters/supplierMaster/allSuppliers", "CREATE");
  const canUpdate = can("/masters/supplierMaster/allSuppliers", "UPDATE");
  const canDelete = can("/masters/supplierMaster/allSuppliers", "DELETE");

  const [formData, setFormData] = useState<Supplier>({
    supplierName: "",
    companyName: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    gstin: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentTermsDays: 30,
    bankName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    notes: "",
    active: true,
  });

  const { showToast } = useToast();

  const fetchSuppliers = async () => {
    setLoading(true);
    const storeId = Cookies.get("storeId") || "";
    const clientId = Cookies.get("userId") || "";

    try {
      const { response, status } = await BackendRequest(
        "/api/masters/supplierMaster/getSuppliers",
        {
          method: "POST",
          body: JSON.stringify({ storeId, clientId }),
        }
      );

      if (status === 200 && response?.data) {
        setSuppliers(response.data);
      } else if (status === 200 && response?.response?.data) {
        setSuppliers(response.response.data);
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      showToast("Failed to fetch supplier directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      supplierName: "",
      companyName: "",
      contactPerson: "",
      phoneNumber: "",
      email: "",
      gstin: "",
      panNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      paymentTermsDays: 30,
      bankName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      notes: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({ ...sup });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      showToast("Supplier name is required", "error");
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
      const endpoint = editingSupplier
        ? "/api/masters/supplierMaster/updateSupplier"
        : "/api/masters/supplierMaster/addSupplier";

      const { response, status } = await BackendRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (status === 200 || status === 201) {
        showToast(
          editingSupplier ? "Supplier updated successfully!" : "Supplier created successfully!",
          "success"
        );
        setIsModalOpen(false);
        fetchSuppliers();
      } else {
        showToast(response?.message || "Failed to save supplier", "error");
      }
    } catch (err) {
      showToast("An error occurred while saving", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to deactivate this supplier?")) return;

    try {
      const { status } = await BackendRequest("/api/masters/supplierMaster/deleteSupplier", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      if (status === 200) {
        showToast("Supplier deactivated successfully", "success");
        fetchSuppliers();
      } else {
        showToast("Failed to delete supplier", "error");
      }
    } catch (err) {
      showToast("Error deleting supplier", "error");
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: "supplierName",
      header: "Supplier & Company",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            {item.supplierName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            {item.companyName || "Independent Supplier"} {item.city ? `• ${item.city}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "contactPerson",
      header: "Contact Person",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800 dark:text-neutral-200">
            {item.contactPerson || "-"}
          </span>
          {item.phoneNumber && (
            <span className="flex items-center gap-1 text-slate-400 dark:text-neutral-500">
              <Phone className="w-3 h-3" /> {item.phoneNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "gstin",
      header: "Tax IDs (GST / PAN)",
      accessor: (item) => (
        <div className="flex flex-col text-xs font-mono">
          <span className="text-slate-800 dark:text-neutral-200">
            GST: {item.gstin || "N/A"}
          </span>
          {item.panNumber && (
            <span className="text-slate-400 dark:text-neutral-500">
              PAN: {item.panNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "paymentTermsDays",
      header: "Credit Terms",
      sortable: true,
      accessor: (item) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          Net {item.paymentTermsDays || 30} Days
        </span>
      ),
    },
    {
      key: "bankName",
      header: "Bank Settlement",
      accessor: (item) => (
        <div className="flex flex-col text-xs">
          {item.bankName ? (
            <>
              <span className="font-medium text-slate-800 dark:text-neutral-200 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-400" /> {item.bankName}
              </span>
              <span className="font-mono text-slate-400 dark:text-neutral-500 text-[11px]">
                {item.bankAccountNumber ? `••••${item.bankAccountNumber.slice(-4)}` : ""}
              </span>
            </>
          ) : (
            <span className="text-slate-400">-</span>
          )}
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
              title="Edit Supplier"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Deactivate Supplier"
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
        title="Supplier & Vendor Directory"
        subtitle="Manage manufacturers, wholesale distributors, purchase terms, and banking details"
        data={suppliers}
        columns={columns}
        loading={loading}
        onRefresh={fetchSuppliers}
        onAddNew={canCreate ? openAddModal : undefined}
        addNewLabel="Add Supplier"
        searchPlaceholder="Search vendor by name, company, GSTIN, or phone..."
        searchFields={["supplierName", "companyName", "contactPerson", "phoneNumber", "gstin", "city"]}
      />

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-900 dark:text-neutral-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold">
                {editingSupplier ? "Edit Supplier Details" : "Register New Supplier / Vendor"}
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
                    Supplier / Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="e.g. Apex Surgical Instruments"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="e.g. Apex Medtech Pvt Ltd"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Key Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson || ""}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="Sales Rep / Manager name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="Supplier contact number"
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
                    placeholder="billing@supplier.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Credit / Payment Terms (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paymentTermsDays || 30}
                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    GSTIN
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
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber || ""}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none uppercase font-mono"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Registered Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="Plot / Industrial Area, City"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName || ""}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none"
                    placeholder="e.g. HDFC Bank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-neutral-300">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber || ""}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none font-mono"
                    placeholder="Account number"
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
                  {isSubmitting ? "Saving..." : editingSupplier ? "Update Supplier" : "Register Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
