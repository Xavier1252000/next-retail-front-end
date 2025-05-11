'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { Button } from '@/components/ui/button';

interface UnitFormDataType {
  unitFullForm: string;
  unitNotation: string;
}

const AddUnitMaster: React.FC = () => {
  const [formData, setFormData] = useState<UnitFormDataType>({
    unitFullForm: '',
    unitNotation: '',
  });

  const { showToast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      const payload = {
        unitFullForm: formData.unitFullForm,
        unitNotation: formData.unitNotation,
      };

      console.log(payload)

      const { response, status } = await BackendRequest('api/masters/unitMaster/addUnitMaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (status === 200 || response?.response?.statusCode === 201) {
        showToast('Unit added successfully');
        router.push('/masters/unitMaster/allUnitmasters');
      } else {
        showToast('Failed to add unit');
      }
    } catch (error) {
      showToast('Something went wrong' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button type="submit" disabled={isSubmitting} className="bg-purple-500 hover:bg-purple-700 text-white w-full">
          {isSubmitting ? 'Saving...' : 'Save Unit'}
        </Button>
      </form>
    </div>
  );
};

export default AddUnitMaster;
