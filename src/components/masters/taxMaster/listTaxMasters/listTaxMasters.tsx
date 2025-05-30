"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface TaxMaster {
  id: string;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
  active: Boolean;
  storeIds: string[];
  taxCode: string;
  taxType: string;
  taxPercentage: number | null;
  applicableOn: string;
  applicableStateIds?: string[];
  applicableCategories?: string[];
  inclusionOnBasePrice: boolean;
  description: string;
}

const TaxMasterTable: React.FC = () => {
  const [data, setData] = useState<TaxMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const cookieStoreId = Cookies.get("storeId");
    setStoreId(cookieStoreId || null);

    const fetchTaxMasters = async () => {
      if (!cookieStoreId) {
        console.warn("No storeId found in cookies.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/masters/taxMaster/taxMasterByStoreId", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: { storeId: cookieStoreId } }),
        });

        const result = await response.json();
        const taxData = result?.response?.data || [];
        setData(taxData);
        console.log("------------------------",taxData)
      } catch (error) {
        console.error("Error fetching tax masters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxMasters();
  }, []);

  const addTaxMaster = () => {
    if (storeId) {
      router.push(`/masters/taxMaster/addTaxMaster?storeId=${storeId}`);
    } else {
      alert("Store ID is missing.");
    }
  };

  if (loading) {
    return <div className="text-purple-600">Loading tax masters...</div>;
  }

  return (
    <div className="mt-10 overflow-x-auto bg-white shadow-md rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-purple-600">Tax Masters</h1>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          onClick={addTaxMaster}
        >
          Add New Tax Master
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No tax master records found.</div>
      ) : (
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-purple-500 text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Tax Code</th>
              <th className="px-4 py-2">Tax Type</th>
              <th className="px-4 py-2">Percentage</th>
              <th className="px-4 py-2">Applicable On</th>
              <th className="px-4 py-2">Categories</th>
              <th className="px-4 py-2">Included in Base Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-300">
            {data.map((tax, index) => (
              <tr key={tax.id} className="hover:bg-purple-100 transition">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{tax.taxCode}</td>
                <td className="px-4 py-2">{tax.taxType}</td>
                <td className="px-4 py-2">
                  {tax.taxPercentage !== null ? `${tax.taxPercentage}%` : "-"}
                </td>
                <td className="px-4 py-2">{tax.applicableOn}</td>
                <td className="px-4 py-2">
                  {(tax.applicableCategories && tax.applicableCategories.length > 0)
                    ? tax.applicableCategories.join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-2">{tax.inclusionOnBasePrice ? "Yes" : "No"}</td>
                <td className="px-4 py-2">{tax.active}</td>
                <td className="px-4 py-2">{tax.description || "-"}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaxMasterTable;
