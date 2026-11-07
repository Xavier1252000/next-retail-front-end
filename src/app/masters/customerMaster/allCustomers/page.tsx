import React from "react";
import CustomerMasterView from "@/components/masters/customerMaster/listCustomerMaster";

export const metadata = {
  title: "Customers Master | Surge Retail",
  description: "Manage retail customers, contact details, GSTIN, and credit ledgers",
};

export default function CustomersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CustomerMasterView />
    </div>
  );
}
