import React from "react";
import SupplierMasterView from "@/components/masters/supplierMaster/listSupplierMaster";

export const metadata = {
  title: "Suppliers & Vendors Master | Surge Retail",
  description: "Manage vendors, distributors, payment terms, and procurement profiles",
};

export default function SuppliersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SupplierMasterView />
    </div>
  );
}
