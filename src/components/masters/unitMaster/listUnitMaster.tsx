'use client';

import React, { useEffect, useState } from 'react';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';

interface UnitData {
  id: string;
  unit: string;
  unitNotation: string;
}

const AllUnitMasters: React.FC = () => {
  const [units, setUnits] = useState<UnitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const  router = useRouter();

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const { response, status } = await BackendRequest('/api/masters/unitMaster/getUnitMaster', {
        method: 'GET',
        headers: {
        },
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
    <div className="relative p-4 mt-13">
      <button
      onClick={handleAddNewUnit}
        className="absolute top-6 right-4 mb bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Add New User
      </button>
      <h1 className="text-2xl font-bold mb-4">All Units</h1>
      {isLoading ? (
        <p>Loading units...</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Unit Name</th>
              <th className="border px-4 py-2">Unit Notation</th>
            </tr>
          </thead>
          <tbody>
            {units.length > 0 ? (
              units.map(unit => (
                <tr key={unit.id}>
                  <td className="border px-4 py-2">{unit.unit}</td>
                  <td className="border px-4 py-2">{unit.unitNotation}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center p-4">
                  No units found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllUnitMasters;
