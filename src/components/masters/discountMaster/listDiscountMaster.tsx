"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DiscountMaster {
  id: string;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
  active: boolean;
  storeIds: string[];
  discountName: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  applicableOn: string;
  discountCouponCode: string;
}

const storeId = "6818e9de026b845f07cc9714"; // Make dynamic if needed

const DiscountMasterTable: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDiscountMasters = async () => {
      try {
        const res = await fetch("/api/masters/discountMaster/getDiscountMaster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { storeIds: [storeId] } }),
        });

        const result = await res.json();
        const records: DiscountMaster[] = result?.response?.data || [];
        setDiscounts(records);
      } catch (err) {
        console.error("Failed to load discount masters", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountMasters();
  }, []);

  if (loading) {
    return <div className="text-purple-600">Loading discount masters...</div>;
  }

  const addDiscountMaster = () => {
    router.push("/masters/discountMaster/addDiscountMaster");
  }

  return (
    <div className="mt-13 overflow-x-auto bg-white shadow-md rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-purple-600">Discount Masters</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium" onClick={addDiscountMaster}>
          Add New Discount Master
        </button>
      </div>

      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-purple-500 text-white">
          <tr>
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Discount Name</th>
            <th className="px-4 py-2">Percentage</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Applicable On</th>
            <th className="px-4 py-2">Coupon Code</th>
            <th className="px-4 py-2">Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-300">
          {discounts.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                No discount masters found.
              </td>
            </tr>
          ) : (
            discounts.map((item, idx) => (
              <tr key={item.id} className="hover:bg-purple-100 transition">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{item.discountName || "-"}</td>
                <td className="px-4 py-2">
                  {item.discountPercentage !== null ? `${item.discountPercentage}%` : "-"}
                </td>
                <td className="px-4 py-2">
                  {item.discountAmount !== null ? `₹${item.discountAmount}` : "-"}
                </td>
                <td className="px-4 py-2">{item.applicableOn || "-"}</td>
                <td className="px-4 py-2">{item.discountCouponCode?.trim() || "-"}</td>
                <td className="px-4 py-2">{item.active ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountMasterTable;
