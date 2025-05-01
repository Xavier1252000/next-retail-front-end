'use client';

import { useToast } from '@/context/toast-context';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useEffect, useState } from 'react';

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  emailId: string;
  mobileNo: string;
  roles: string[];
  createdOn: string;
  modifiedOn: string;
  createdBy: string | null;
  modifiedBy: string | null;
  active: boolean;
}

interface FormDataType {
  index: number;
  itemPerIndex: number;
  roles: string[];
  userIds: string[];
  fromDate: string | null;
  toDate: string | null;
  active: boolean;
}

export const useAllUsers = () => {
  const [formData, setFormData] = useState<FormDataType>({
    index: 0,
    itemPerIndex: 100,
    roles: [],
    userIds: [],
    fromDate: null,
    toDate: null,
    active: true,
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const toISOStringOrNull = (date?: string | null): string | null => {
    if (!date) return null;
    try {
      return new Date(date).toISOString();
    } catch {
      return null;
    }
  };

  const fetchUsers = async (filters: FormDataType = formData) => {
    setIsSubmitting(true);
    const payload = {
      data: {
        index: filters.index,
        itemPerIndex: filters.itemPerIndex,
        roles: filters.roles,
        userIds: filters.userIds,
        fromDate: toISOStringOrNull(filters.fromDate),
        toDate: toISOStringOrNull(filters.toDate),
        active: filters.active,
      },
    };

    try {
      const { response, status } = await BackendRequest('api/all-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (status === 200 || response?.response?.statusCode === 200) {
        setUsers(response?.response?.data || []);
      } else {
        showToast('Failed to fetch users');
      }
    } catch (err) {
      showToast('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (['index', 'itemPerIndex'].includes(name)) {
      newValue = value ? Number(value) : 0;
    } else if (name === 'roles' || name === 'userIds') {
      newValue = value ? value.split(',').map(item => item.trim()) : [];
    } else {
      newValue = value || null;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchUsers(formData);
  };

  useEffect(() => {
    fetchUsers(); // Fetch on initial load
  }, []);

  return {
    formData,
    users,
    handleChange,
    handleSubmit,
    isSubmitting,
  };
};
