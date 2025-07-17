import { useEffect, useState } from 'react';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import Cookies from 'js-cookie';

export type Item = {
  id: string;
  itemName: string;
  costPrice:number;
  finalPrice: number;
  itemStock: number;
  skuCode: string;
  stockThreshold: number;
  stockUnit: string;
  isReturnable: boolean;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
  active: boolean;
  storeId: string;
  profitToGainInPercentage: number;
  baseSellingPrice: number;
  additionalPrice: number;
  applicableTaxes: [];
  totalTaxPrice: number;
  discountMasterIds: [];
  totalDiscountPrice: number;
  profitMargin: number;
  markupPercentage: number;
  brand: string;
  categoryIds: [];
  description: string;
  itemImageInfoIds: [];
  barcode: string;
  thresholdQuantityForAddTax: number;
  isWarrantyAvailable: boolean;
  warrantyPeriod : string;
  expiryDate: string;
};

interface UseAllItemsProps {
  storeId: string;
  itemPerIndex?: number;
}

export function useAllItems({ storeId}: UseAllItemsProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const[itemPerIndex, setItemPerIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    console.log(storeId, index, itemPerIndex)
    setLoading(true);
    const payload = {
        data:{
        storeId,
        index,
        itemPerIndex:100
        }
    }
    
    try {
      const {response, status} = await BackendRequest("/api/billing/createInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const resData = response?.response?.data;
      setItems(resData.items);
      setTotalPages(resData.totalPages);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(Cookies.get("userRoles"))
    fetchItems();
  }, [storeId, index, itemPerIndex]);

  return {
    items,
    index,
    itemPerIndex,
    totalPages,
    loading,
    setIndex,
    setItemPerIndex
  }
};
