import React from "react";
import StockManagementView from "@/components/inventoryManagement/stock/stockManagement";

export const metadata = {
  title: "Stock & Inventory Control | Surge Retail",
  description: "Real-time inventory levels, low-stock alerts, stock write-offs, and audit adjustments",
};

export default function StockPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <StockManagementView />
    </div>
  );
}
