'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

interface DiscountFormData {
  discountMasterId?: string | null;
  discountName: string;
  discountPercentage: number;
  applicableOn: 'Item' | 'Invoice' | 'Store' | '';
  discountCouponCode: string;
  storeIds: string[];
}

type AddDiscountMasterProps = {
  discountMasterId?: string;
};

interface StoreOption {
  id: string;
  name: string;
}

const AddDiscountMaster: React.FC<AddDiscountMasterProps> = ({ discountMasterId }: AddDiscountMasterProps) => {
  const [formData, setFormData] = useState<DiscountFormData>({
    discountMasterId: null,
    discountName: '',
    discountPercentage: 0,
    applicableOn: '',
    discountCouponCode: '',
    storeIds: [],
  });



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([]);
  const { showToast } = useToast();
  const [storeId, setStoreId] = useState<string>();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // ✅ Set storeId and role only once on mount
  useEffect(() => {
    const activeStoreId = Cookies.get("storeId");
    if (activeStoreId) setStoreId(activeStoreId);

    const userRoles = Cookies.get("userRoles");
    let roles: string[] = [];

    try {
      roles = JSON.parse(userRoles || "[]");
    } catch (err) {
      console.error("Error parsing userRoles:", err);
    }

    if (roles.includes('CLIENT')) {
      setIsClient(true);
    }
  }, []);


  // Fetch store list for dropdown
  useEffect(() => {
    const fetchStores = async () => {
      try {
        // Demo API - replace later
        const { response, status } = await BackendRequest('/api/demo/stores', {
          method: 'GET',
        });

        if (status === 200 && response?.response?.statusCode === 200) {
          const stores = response.response.data || [];
          setStoreOptions(stores);
        } else {
          showToast('Failed to fetch store list');
        }
      } catch (err) {
        // console.error('Error fetching stores:', err);
        // showToast('Error fetching store list');
      }
    };

    fetchStores();
  }, []);

  // Fetch discount data if editing
  useEffect(() => {
    if (discountMasterId && discountMasterId.trim() !== '') {
      const fetchDiscountData = async () => {
        try {
          // Demo API - replace later
          const { response, status } = await BackendRequest(`/api/demo/discountMaster/${discountMasterId}`, {
            method: 'GET',
          });

          if (status === 200 && response?.response?.statusCode === 200) {
            const data = response.response.data;
            setFormData({
              discountMasterId: data.id,
              discountName: data.discountName || '',
              discountPercentage: data.discountPercentage || 0,
              applicableOn: data.applicableOn || '',
              discountCouponCode: data.discountCouponCode || '',
              storeIds: data.storeIds || [],
            });
          } else {
            showToast('Failed to fetch discount details.');
          }
        } catch (err) {
          console.error('Error fetching discount data:', err);
          showToast('Error fetching discount data');
        }
      };

      fetchDiscountData();
    }
  }, [discountMasterId]);

  // Handle form change for text/number fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'discountPercentage'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Handle multiple store selection
  const handleStoreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      storeIds: selectedOptions,
    }));
  };

  // Handle submit (add or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      discountMasterId: formData.discountMasterId,
      discountName: formData.discountName,
      discountPercentage: formData.discountPercentage,
      applicableOn: formData.applicableOn,
      discountCouponCode: formData.discountCouponCode,
      storeIds: isClient ? formData.storeIds : storeId ? [storeId] : [], // client can select store but staff will set only active stores.
    };

    try {
      // Determine if add or update
      const endpoint = formData.discountMasterId
        ? '/api/demo/discountMaster/updateDiscountMaster'
        : '/api/masters/discountMaster/addDiscountMaster';

      const { response, status } = await BackendRequest(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (status === 201 || response?.response?.statusCode === 201) {
        showToast(response.response.message, "success");
        router.push('/masters/discountMaster/allDiscountMasters');
      } else {
        showToast(response?.response?.message || 'Failed to save discount', "error");
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      showToast('Something went wrong: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-md mt-[3.25rem]">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {formData.discountMasterId ? 'Update Discount' : 'Add Discount'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Discount Name */}
          <div>
            <label className="block mb-1">Discount Name</label>
            <input
              type="text"
              name="discountName"
              value={formData.discountName}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block mb-1">Discount Percentage (%)</label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              // step="1"
              // required
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Applicable On Dropdown */}
          <div>
            <label className="block mb-1">Applicable On</label>
            <select
              name="applicableOn"
              value={formData.applicableOn}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select Option</option>
              <option value="Item">Item</option>
              <option value="Invoice">Invoice</option>
              <option value="Store">Store</option>
            </select>
          </div>

          {/* Discount Coupon Code */}
          <div>
            <label className="block mb-1">Discount Coupon Code</label>
            <input
              type="text"
              name="discountCouponCode"
              value={formData.discountCouponCode}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Store Multi-Select Dropdown */}

          {isClient && <div>
            <label className="block mb-1">Applicable Stores</label>
            <select
              name="storeIds"
              multiple
              value={formData.storeIds}
              onChange={handleStoreSelect}
              className="w-full border p-2 rounded h-32"
            >
              {storeOptions.length > 0 ? (
                storeOptions.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))
              ) : (
                <option disabled>No stores available</option>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              (Hold Ctrl or Command to select multiple)
            </p>
          </div>}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-500 hover:bg-purple-700 text-white w-full"
          >
            {isSubmitting ? 'Saving...' : 'Save Discount'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddDiscountMaster;
