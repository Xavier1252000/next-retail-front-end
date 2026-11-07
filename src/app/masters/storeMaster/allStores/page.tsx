import React from "react";
import StoreMasterView from "@/components/masters/storeMaster/listStoreMaster";

export const metadata = {
  title: "Stores & Warehouses Master | Surge Retail",
  description: "Manage multiple retail outlets, branch stores, and warehouse locations",
};

export default function StoresPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <StoreMasterView />
    </div>
  );
}
