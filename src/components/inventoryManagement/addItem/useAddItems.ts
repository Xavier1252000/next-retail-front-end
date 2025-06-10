import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { KeyboardEvent, useEffect, useState } from "react";
import { toISOStringOrNull } from "@/utils/helper";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export interface FormDataType {
  storeId: string;
  itemName: string | null;
  costPrice: number | null;
  profitToGainInPercentage: number | null;
  baseSellingPrice: number | null;
  additionalPrice: number | null;
  applicableTaxes: string[] | null;
  discountMasterIds: string[] | null;
  brand: string | null;
  categoryIds: string[] | null;
  supplierId: string | null;
  description: string | null;
  itemImageInfoIds: string[] | null;
  itemStock: number | null;
  stockThreshold: number | null;
  tutorialLinks: string[] | null;
  barcode: string | null;
  stockUnit: string | null;
  isReturnable: boolean | null;
  isWarrantyAvailable: boolean | null;
  warrantyPeriodYears: number | null;
  warrantyPeriodMonths: number | null;
  warrantyPeriodDays: number | null;
  expiryDate: string | null;
}

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

export const UseAddItems = () => {
  const [formData, setFormData] = useState<FormDataType>({
    storeId: "",
    itemName: "",
    costPrice: null,
    profitToGainInPercentage: null,
    baseSellingPrice: null,
    additionalPrice: null,
    applicableTaxes: null,
    discountMasterIds: null,
    brand: "",
    categoryIds: [],
    supplierId: "",
    description: null,
    itemImageInfoIds: null,
    itemStock: null,
    stockThreshold: null,
    tutorialLinks: [],
    barcode: "",
    stockUnit: "",
    isReturnable: false,
    isWarrantyAvailable: false,
    warrantyPeriodYears: null,
    warrantyPeriodMonths: null,
    warrantyPeriodDays: null,
    expiryDate: null,
  });

  const [addedItem, setAddedItem] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxOptions, setTaxOptions] = useState<TaxMaster[]>([]);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [itemCategoryOptions, setItemCategoryOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const { showToast } = useToast();
  const router = useRouter();

  const storeId = Cookies.get("storeId");

  // fetching tax options
  const fetchTaxMaster = async () => {
    const payload = {
      data: {
        storeId: storeId
      }
    };
    try {
      setIsSubmitting(true);
      const { response, status } = await BackendRequest("/api/masters/taxMaster/taxMasterByStoreId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 200) {
        setTaxOptions(response?.response?.data);
        // showToast("Item added successfully");
      } else {
        showToast(response?.response?.message || "Failed to add item");
      }
    } catch (err) {
      showToast("Something went wrong!");
    }
  };

  // fetching discount options
  const fetchDiscountMaster = async () => {
    const payload = {
      data: {
        storeIds: [storeId]
      }
    }
    try {
      const { response, status } = await BackendRequest("/api/masters/discountMaster/getDiscountMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (status === 200 || response?.response?.statusCode === 200) {
        setDiscountOptions(response?.response.data);
      } else {
        showToast(response?.response?.message || "Failed to add item");
      }
    } catch (error) {
      showToast("something went wrong while fetching discounts")
    }
  }

  // fetching unit options
  const fetchUnitOptions = async () => {
    const payload = {
      data: {
        storeIds: [storeId]
      }
    }

    try {
      const { response, status } = await BackendRequest('/api/masters/unitMaster/getUnitMaster', {
        method: 'POST',
        headers: {
        },
        body: JSON.stringify(payload)
      });

      if (status === 200 && response?.response?.statusCode === 200) {
        setUnitOptions(response?.response?.data || []);
      } else {
        showToast('Failed to fetch units');
      }
    } catch (error) {
      showToast('Something went wrong while fetching units');
    }
  }

  // fetching category options
  const fetchItemCategoryOptions = async () => {
    const payload = {
      data: {
        storeIds: [storeId]
      }
    }

    try {
      const { response, status } = await BackendRequest('/api/masters/itemCategoryMaster/getAllItemCategoryMaster', {
        method: 'POST',
        headers: {
        },
        body: JSON.stringify(payload)
      });

      if (status === 200 && response?.response?.statusCode === 200) {
        setItemCategoryOptions(response?.response?.data || []);
      } else {
        showToast('Failed to fetch units');
      }
    } catch (error) {
      showToast('Something went wrong while fetching units');
    }
  }


  // fetching all the dropdowns
  useEffect(() => {
    fetchTaxMaster();
    fetchDiscountMaster();
    fetchUnitOptions();
    fetchItemCategoryOptions();
  }
    , []);

  const addItem = async (item: FormDataType = formData) => {
    const payload = {
      data: {
        ...item,
        storeId: storeId,
        expiryDate: item.expiryDate ? toISOStringOrNull(item.expiryDate) : ""
      }
    };

    try {
      console.log("try running")
      setIsSubmitting(true);

      const { response, status } = await BackendRequest("/api/inventoryManagement/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 201) {
        setAddedItem(response?.response?.data);
        router.push("/inventoryManagement/allItems")
        showToast("Item added successfully");
      } else {
        showToast(response?.response?.message || "Failed to add item");
      }
    } catch (err) {
      showToast("Something went wrong!" + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange: any = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;
    let newValue: any;

    if (target instanceof HTMLInputElement) {
      const { type, value, checked, files, multiple } = target;
      if (type === "checkbox") newValue = checked;
      else if (type === "number") newValue = value ? Number(value) : null;
      else if (type === "file") newValue = multiple ? Array.from(files || []) : files?.[0] || null;
      else newValue = value || null;
    } else if (target instanceof HTMLSelectElement) {
      newValue = target.multiple
        ? Array.from(target.selectedOptions).map((opt) => opt.value)
        : target.value || null;
    } else {
      newValue = target.value || null;
    }

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: newValue };

      if (name === "profitToGainInPercentage" && updatedData.costPrice != null && newValue != null) {
        const profitPercentage = newValue;
        const costPrice = updatedData.costPrice;
        const baseSellingPrice = costPrice + (costPrice * profitPercentage / 100);
        updatedData.baseSellingPrice = Math.round(baseSellingPrice * 100) / 100;
      } else if (name === "baseSellingPrice" && updatedData.costPrice != null && newValue != null && updatedData.costPrice !== 0) {
        const baseSellingPrice = newValue;
        const costPrice = updatedData.costPrice;
        const profitPercentage = ((baseSellingPrice - costPrice) / costPrice) * 100;
        updatedData.profitToGainInPercentage = Math.round(profitPercentage * 100) / 100;
      } else if (name === "costPrice" && newValue != null) {
        if (prev.profitToGainInPercentage != null) {
          const profitPercentage = prev.profitToGainInPercentage;
          const costPrice = newValue;
          const baseSellingPrice = costPrice + (costPrice * profitPercentage / 100);
          updatedData.baseSellingPrice = Math.round(baseSellingPrice * 100) / 100;
        } else if (prev.baseSellingPrice != null && newValue !== 0) {
          const baseSellingPrice = prev.baseSellingPrice;
          const costPrice = newValue;
          const profitPercentage = ((baseSellingPrice - costPrice) / costPrice) * 100;
          updatedData.profitToGainInPercentage = Math.round(profitPercentage * 100) / 100;
        }
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem(formData);
  };

  const preventInvalidNumberInput = (e: KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "."
    ];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return {
    addedItem,
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    preventInvalidNumberInput,
    taxOptions,
    discountOptions,
    itemCategoryOptions,
    supplierOptions,
    unitOptions
  };
};
