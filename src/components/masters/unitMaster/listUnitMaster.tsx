'use client';

import React, { useEffect, useState } from 'react';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import editIcon from '../../../icons/editIcon.png';
import Image from 'next/image';

interface UnitData {
  id: string;
  unit: string;
  unitNotation: string;
  active: boolean;
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
    router.push("/masters/unitMaster/addUnitMaster");
  }

  function editUnit(unitMasterId: string): void {
    router.push("/masters/unitMaster/updateUnitMaster/" + unitMasterId);
  }


  async function changeUnitStatus(id: string) {
    const unit = units.find(u => u.id === id);
    if (!unit) return;

    try {
      const { response, status } = await BackendRequest('/api/masters/unitMaster/unitMasterStatusChange/' + id, {
        method: 'GET',
        headers: {}
      });

      if (status === 200 && response?.response?.statusCode === 200) {
        const updatedUnit = response.response.data;

        // Replace the old unit with the updated one
        setUnits(prevUnits =>
          prevUnits.map(u => u.id === id ? updatedUnit : u)
        );

        showToast('Status updated successfully', "success");
      } else {
        showToast('Failed to change status', "error");
      }
    } catch (error) {
      showToast('Something went wrong', "error");
    }
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
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-300">
            {units.map((unit, index) => (
              <tr key={unit.id} className="hover:bg-purple-100 transition">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{unit.unit}</td>
                <td className="px-4 py-2">{unit.unitNotation}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {/* Edit Icon with Hover Label */}
                    <div className="relative group cursor-pointer">
                      <Image
                        src={editIcon}
                        alt="Edit icon"
                        width={25}
                        height={25}
                        onClick={() => editUnit(unit.id)}
                        className="hover:scale-110 transition-transform"
                      />
                      <div className="z-10 absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs bg-white px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </div>
                    </div>


                    {/* Toggle Active/Inactive Button */}
<div className="flex items-center gap-2">
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={unit.active}
      onChange={() => changeUnitStatus(unit.id)}
      className="sr-only peer"
      // aria-label="Toggle Active Status"
    />
    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition-colors duration-300 relative">
      {/* Movable circle */}
      <div
        className="
          absolute top-0.5 left-0.5
          bg-white w-5 h-5 rounded-full shadow-md
          transform transition-transform duration-300
          peer-checked:translate-x-5
        "
      />
    </div>
    <span className="ml-3 text-sm font-medium text-gray-900">
      {unit.active ? 'Active' : 'Inactive'}
    </span>
  </label>
</div>





                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllUnitMasters;
