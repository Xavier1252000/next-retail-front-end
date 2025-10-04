'use client';

import React, { useEffect, useState } from 'react';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface UnitData {
  id: string;
  unit: string;
  unitNotation: string;
}

const AllUnitMasters: React.FC = () => {
  const [units, setUnits] = useState<UnitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  // creating payload with storeId while for staff
  const userRoles = Cookies.get("userRoles");
  let roles: string[] = [];

  try {
    roles = JSON.parse(userRoles || "[]");
  } catch (err) {
    console.error("Error parsing userRoles:", err);
  }

  let payload = {}

  if (roles.includes("STAFF")) {
    const storeId = Cookies.get("storeId");
    payload = {
      data: {
        storeIds: [storeId]
      }
    };
  } else {
    payload = {
      data: {
        storeIds: []
      }
    }
  }

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const { response, status } = await BackendRequest('/api/masters/unitMaster/getUnitMaster', {
        method: 'POST',
        headers: {
        },
        body: JSON.stringify(payload)
      });
      
      if (status === 200 && response?.response?.statusCode === 200) {
        setUnits(response?.response?.data || []);
      } else {
        showToast('Failed to fetch units');
      }
    } catch (error) {
      showToast('Something went wrong while fetching units');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleAddNewUnit = () => {
    router.push("/masters/unitMaster/addUnitMaster")
  }

  return (
  <div className="mt-10 overflow-x-auto bg-white shadow-md rounded-xl p-4">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-semibold text-purple-600">Unit Masters</h1>
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        onClick={handleAddNewUnit}
      >
        Add New Unit
      </button>
    </div>

    {isLoading ? (
      <div className="text-center text-gray-500 py-10">Loading units...</div>
    ) : units.length === 0 ? (
      <div className="text-center text-gray-500 py-10">No unit master records found.</div>
    ) : (
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-purple-500 text-white">
          <tr>
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Unit Name</th>
            <th className="px-4 py-2">Unit Notation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-300">
          {units.map((unit, index) => (
            <tr key={unit.id} className="hover:bg-purple-100 transition">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{unit.unit}</td>
              <td className="px-4 py-2">{unit.unitNotation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
};

export default AllUnitMasters;
