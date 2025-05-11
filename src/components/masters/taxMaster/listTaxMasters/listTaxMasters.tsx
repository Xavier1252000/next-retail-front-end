// components/TaxMasterTable.tsx
"use client";
import React, { useEffect, useState } from "react";

interface TaxMaster {
  id: string;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
  active: boolean;
  storeIds: string[];
  taxCode: string;
  taxType: string;
  taxPercentage: number;
  applicableOn: string;
  applicableStateIds: string[];
  applicableCategories: string[];
  inclusionOnBasePrice: boolean;
  description: string;
}

const storeId = "680cc4cf0041f117f34e290b"; // Replace with dynamic value if needed

const BackendRequest = async (): Promise<TaxMaster[]> => {
  const response = await fetch("/api/masters/taxMaster/taxMasterByStoreId", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: { storeId },
    }),
  });

  const result = await response.json();
  return result?.response?.data || [];
};

const TaxMasterTable: React.FC = () => {
  const [data, setData] = useState<TaxMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxMasters = async () => {
      try {
        const taxData = await BackendRequest();
        setData(taxData);
      } catch (error) {
        console.error("Error fetching tax masters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxMasters();
  }, []);

  if (loading) {
    return <div className="text-purple-600">Loading tax masters...</div>;
  }

  return (
    <div className="mt-13 overflow-x-auto bg-white shadow-md rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-purple-600">Tax Masters</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Add New Tax Master
        </button>
      </div>
  
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-purple-500 text-white">
          <tr>
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Tax Code</th>
            <th className="px-4 py-2">Tax Type</th>
            <th className="px-4 py-2">Percentage</th>
            <th className="px-4 py-2">Applicable On</th>
            <th className="px-4 py-2">States</th>
            <th className="px-4 py-2">Categories</th>
            <th className="px-4 py-2">Included in Base Price</th>
            <th className="px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-300">
          {data.map((tax, index) => (
            <tr key={tax.id} className="hover:bg-purple-100 transition">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{tax.taxCode}</td>
              <td className="px-4 py-2">{tax.taxType}</td>
              <td className="px-4 py-2">{tax.taxPercentage}%</td>
              <td className="px-4 py-2">{tax.applicableOn}</td>
              <td className="px-4 py-2">
                {tax.applicableStateIds.join(", ")}
              </td>
              <td className="px-4 py-2">
                {tax.applicableCategories.join(", ")}
              </td>
              <td className="px-4 py-2">
                {tax.inclusionOnBasePrice ? "Yes" : "No"}
              </td>
              <td className="px-4 py-2">{tax.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );  
};

export default TaxMasterTable;
