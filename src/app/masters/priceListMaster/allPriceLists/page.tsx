import React from "react";
import PriceListMasterView from "@/components/masters/priceListMaster/listPriceListMaster";

export const metadata = {
  title: "Price Lists Master | Surge Retail",
  description: "Configure multi-tier pricing, wholesale rules, VIP markups, and promotional discounts",
};

export default function PriceListsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PriceListMasterView />
    </div>
  );
}
