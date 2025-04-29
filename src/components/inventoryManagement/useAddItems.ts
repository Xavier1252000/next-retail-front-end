import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { KeyboardEvent, useEffect, useState } from "react";
import { toISOStringOrNull } from "@/utils/helper";
export interface FormDataType {
  storeId: string | "680cc4cf0041f117f34e290b";
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

export interface AddItemResponseType {
  createdOn: string;
  modifiedOn: string;
  createdBy: string | null;
  modifiedBy: string | null;
  active: boolean;
  id: string;
  storeId: string | null;
  itemName: string;
  costPrice: number;
  profitToGainInPercentage: number;
  baseSellingPrice: number;
  additionalPrice: number;
  applicableTaxes: string[];
  totalTaxPrice: number;
  discountMasterIds: string[];
  totalDiscountPrice: number | null;
  finalPrice: number;
  profitMargin: number;
  markupPercentage: number;
  brand: string;
  categoryIds: string[];
  supplierId: string;
  description: string;
  itemImageInfoIds: string[];
  itemStock: number;
  stockThreshold: number;
  tutorialLinks: string[];
  skuCode: string;
  barcode: string;
  stockUnit: string;
  isReturnable: boolean;
  isWarrantyAvailable: boolean;
  warrantyPeriod: string;
  expiryDate: string;
}

export const UseAddItems = () => {

  const [formData, setFormData] = useState<FormDataType>({
    storeId: "680cc4cf0041f117f34e290b", // Keep as is, since it's hardcoded
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

  const [addedItem, setAddedItem] = useState<AddItemResponseType | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();

  const addItem = async (item: FormDataType = formData) => {
    item.storeId = "680cc4cf0041f117f34e290b";
    const payload = {
      storeId: item.storeId,
      itemName: item.itemName,
      costPrice: item.costPrice,
      profitToGainInPercentage: item.profitToGainInPercentage,
      baseSellingPrice: item.baseSellingPrice,
      additionalPrice: item.additionalPrice,
      applicableTaxes: item.applicableTaxes,
      discountMasterIds: item.discountMasterIds,
      brand: item.brand,
      categoryIds: item.categoryIds,
      supplierId: item.supplierId,
      description: item.description,
      itemImageInfoIds: item.itemImageInfoIds,
      itemStock: item.itemStock,
      stockThreshold: item.stockThreshold,
      tutorialLinks: item.tutorialLinks,
      skuCode: item.skuCode,
      barcode: item.barcode,
      stockUnit: item.stockUnit,
      isReturnable: item.isReturnable,
      isWarrantyAvailable: item.isWarrantyAvailable,
      warrantyPeriodYears: item.warrantyPeriodYears,
      warrantyPeriodMonths: item.warrantyPeriodMonths,
      warrantyPeriodDays: item.warrantyPeriodDays,
      expiryDate: toISOStringOrNull(item.expiryDate),
    };

    try {
      setIsSubmitting(true);
      const { response, status } = await BackendRequest("api/inventoryManagement/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 201) {
        setAddedItem(response?.response?.data || null);
      } else {
        showToast(response.response.message);
      }
    } catch (error) {
      showToast("Something went wrong!!!");
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

      if (type === "checkbox") {
        newValue = checked;
      } else if (type === "number") {
        newValue = value ? Number(value) : null;
      } else if (type === "file") {
        newValue = multiple ? Array.from(files || []) : files?.[0] || null;
      } else {
        newValue = value || null;
      }
    } else if (target instanceof HTMLSelectElement) {
      if (target.multiple) {
        newValue = Array.from(target.selectedOptions).map((opt) => opt.value);
      } else {
        newValue = target.value || null;
      }
    } else if (target instanceof HTMLTextAreaElement) {
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
    if (e.type === "keydown") {
      const keyEvent = e as KeyboardEvent<HTMLInputElement>;
      const allowedKeys = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab","."
      ];
      if (!allowedKeys.includes(keyEvent.key)) {
        keyEvent.preventDefault();
      }
    } else if (e.type === "input") {
      const inputEvent = e as React.FormEvent<HTMLInputElement>;
      const target = inputEvent.target as HTMLInputElement;
      const originalValue = target.value;
      // Remove any non-numeric characters
      target.value = originalValue.replace(/[^0-9]/g, "");
      // Trigger onChange if the value was modified
      if (target.value !== originalValue) {
        const changeEvent = new Event("change", { bubbles: true });
        target.dispatchEvent(changeEvent);
      }
    }
  };

  // const router = useRouter();
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = Cookies.get("authToken");
  //     if (!token) await router.push("/login");
  //   };
  //   checkAuth();
  // }, [router]);

  return {
    addedItem,
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    preventInvalidNumberInput,
  };
};