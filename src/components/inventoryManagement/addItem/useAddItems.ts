import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { KeyboardEvent, useEffect, useState } from "react";
import { toISOStringOrNull } from "@/utils/helper";

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
  skuCode: string | null;
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
    storeId: "680cc4cf0041f117f34e290b",
    itemName: null,
    costPrice: null,
    profitToGainInPercentage: null,
    baseSellingPrice: null,
    additionalPrice: null,
    applicableTaxes: null,
    discountMasterIds: null,
    brand: null,
    categoryIds: null,
    supplierId: null,
    description: null,
    itemImageInfoIds: null,
    itemStock: null,
    stockThreshold: null,
    tutorialLinks: null,
    skuCode: null,
    barcode: null,
    stockUnit: null,
    isReturnable: null,
    isWarrantyAvailable: null,
    warrantyPeriodYears: null,
    warrantyPeriodMonths: null,
    warrantyPeriodDays: null,
    expiryDate: null,
  });

  const [addedItem, setAddedItem] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxOptions, setTaxOptions] = useState<TaxMaster[]>([]);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {

    
    
  }, []);

  const addItem = async (item: FormDataType = formData) => {
    if (item.baseSellingPrice && item.profitToGainInPercentage) {
      showToast("Provide either Base Selling Price or Profit %, not both");
      return;
    }

    const payload = {
      ...item,
      expiryDate: toISOStringOrNull(item.expiryDate)
    };

    try {
      setIsSubmitting(true);
      const { response, status } = await BackendRequest("api/inventoryManagement/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 201) {
        setAddedItem(response?.response?.data);
        showToast("Item added successfully");
      } else {
        showToast(response?.response?.message || "Failed to add item");
      }
    } catch (err) {
      showToast("Something went wrong!");
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

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
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
    categoryOptions,
    supplierOptions,
  };
};
