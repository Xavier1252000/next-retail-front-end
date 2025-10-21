'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

interface UnitFormDataType {
  unitMasterId: string | null;
  unitFullForm: string;
  unitNotation: string;
}

type AddUnitMasterProps = {
  unitMasterId: string;
};

const AddUnitMaster: React.FC<AddUnitMasterProps> = ({unitMasterId}) => {
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [formData, setFormData] = useState<UnitFormDataType>({
    unitMasterId: '',
    unitFullForm: '',
    unitNotation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();

  // Detect role once on mount
  useEffect(() => {
    const userRoles = Cookies.get('userRoles');
    try {
      const roles: string[] = JSON.parse(userRoles || '[]');
      if (roles.includes('STAFF')) {
        setIsStaff(true);
      }
    } catch (err) {
      console.error('Error parsing userRoles:', err);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const storeId = Cookies.get('storeId');

    const payload = {
      unitMasterId: formData.unitMasterId,
      unitFullForm: formData.unitFullForm,
      unitNotation: formData.unitNotation,
      storeIds: isStaff && storeId ? [storeId] : [],
    };

    try {
      const { response, status } = await BackendRequest('/api/masters/unitMaster/addUnitMaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (status === 201 || response?.response?.statusCode === 201) {
        showToast('Unit added successfully');
        router.push('/masters/unitMaster/allUnitMasters');
      } else {
        showToast(response?.response.message);
      }
    } catch (error) {
      showToast('Something went wrong: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
  if (unitMasterId && unitMasterId.trim() !== '') {
    const fetchUnitData = async () => {
      try {
        const { response, status } = await BackendRequest(`/api/masters/unitMaster/unitMasterById/${unitMasterId}`, {
          method: 'GET',
        });

        if (status === 200 && response?.response?.statusCode === 200) {
          const data = response.response.data;
          setFormData(prev => ({
            ...prev,
            unitMasterId: data.id,
            unitFullForm: data.unit || '',
            unitNotation: data.unitNotation || '',
          }));
        } else {
          showToast('Failed to fetch unit details.');
        }
      } catch (err) {
        console.error('Error fetching unit data:', err);
        showToast('Error fetching unit data');
      }
    };

    fetchUnitData();
  }
}, [unitMasterId]);


  return (
    <div className="p-6 mt-[3.25rem]">
      <h1 className="text-2xl font-bold mb-4">Add Unit</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Unit Full Form</label>
          <input
            type="text"
            name="unitFullForm"
            value={formData.unitFullForm}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Unit Notation</label>
          <input
            type="text"
            name="unitNotation"
            value={formData.unitNotation}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-500 hover:bg-purple-700 text-white w-full"
        >
          {isSubmitting ? 'Saving...' : 'Save Unit'}
        </Button>
      </form>
    </div>
  );
};

export default AddUnitMaster;
