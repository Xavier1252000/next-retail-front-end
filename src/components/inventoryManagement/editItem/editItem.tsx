"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { motion } from "framer-motion";
import { ItemDetailsProps, ItemDetailsResponse } from "../itemDetails/itemDetails";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useToast } from "@/context/toast-context";
import { toISOStringOrNull } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { TaxMaster } from "@/components/masters/taxMaster/listTaxMasters/listTaxMasters";

export interface FormDataType {
  itemId: string;
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

const EditItem: React.FC<ItemDetailsProps> = ({ itemId }) => {
  const { showToast } = useToast();
  const router = useRouter();

  const [itemDetails, setItemDetails] = useState<ItemDetailsResponse | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    itemId: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxOptions, setTaxOptions] = useState<TaxMaster[]>([]);
  const [discountOptions, setDiscountOptions] = useState<any[]>([]);
  const [unitOptions, setUnitOptions] = useState<any[]>([]);
  const [itemCategoryOptions, setItemCategoryOptions] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);

  // Fetch item details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const payload = { data: { itemId } };
        const { response, status } = await BackendRequest("/api/inventoryManagement/itemDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (status === 200 && response?.response?.statusCode === 200) {
          const data = response?.response?.data;
          setItemDetails(data);
          setFormData({
            itemId: data.id || "",
            storeId: data.storeId || "",
            itemName: data.itemName || "",
            costPrice: data.costPrice ?? null,
            profitToGainInPercentage: data.profitToGainInPercentage ?? null,
            baseSellingPrice: data.baseSellingPrice ?? null,
            additionalPrice: data.additionalPrice ?? null,
            applicableTaxes: data.applicableTaxes?.map((tax: any) => tax.id) || [],
            discountMasterIds: data.applicableDiscounts?.map((discount: any) => discount.id) || [],
            brand: data.brand || "",
            categoryIds: data.categoryIds || [],
            supplierId: data.supplierId || "",
            description: data.description || null,
            itemImageInfoIds: data.itemImageInfoIds || null,
            itemStock: data.itemStock ?? null,
            stockThreshold: data.stockThreshold ?? null,
            tutorialLinks: data.tutorialLinks || [],
            barcode: data.barcode || "",
            stockUnit: data.stockUnit || "",
            isReturnable: data.isReturnable ?? false,
            isWarrantyAvailable: data.isWarrantyAvailable ?? false,
            warrantyPeriodYears: data.warrantyYears ?? null,
            warrantyPeriodMonths: data.warrantyMonths ?? null,
            warrantyPeriodDays: data.warrantyDays ?? null,
            expiryDate: data.expiryDate || null,
          });
        } else {
          showToast(response?.response?.message || "Failed to fetch item details");
        }
      } catch (err) {
        showToast(`Item couldn't be fetched! ${err}`);
      }
    };

    fetchItemDetails();
  }, [itemId, showToast]);

  // Fetch dropdown options
  const fetchTaxMaster = async () => {
    if (!itemDetails?.storeId) return;
    const payload = { data: { storeId: itemDetails.storeId } };
    try {
      setIsSubmitting(true);
      const { response, status } = await BackendRequest("/api/masters/taxMaster/taxMasterByStoreId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 200) {
        setTaxOptions(response?.response?.data || []);
      } else {
        showToast(response?.response?.message || "Failed to fetch taxes");
      }
    } catch (err) {
      showToast("Something went wrong while fetching taxes!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDiscountMaster = async () => {
    if (!itemDetails?.storeId) return;
    const payload = { data: { storeIds: [itemDetails.storeId] } };
    try {
      const { response, status } = await BackendRequest("/api/masters/discountMaster/getDiscountMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 200 || response?.response?.statusCode === 200) {
        setDiscountOptions(response?.response?.data || []);
      } else {
        showToast(response?.response?.message || "Failed to fetch discounts");
      }
    } catch (err) {
      showToast("Something went wrong while fetching discounts!");
    }
  };

  const fetchUnitOptions = async () => {
    if (!itemDetails?.storeId) return;
    const payload = { data: { storeIds: [itemDetails.storeId] } };
    try {
      const { response, status } = await BackendRequest("/api/masters/unitMaster/getUnitMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 200 && response?.response?.statusCode === 200) {
        setUnitOptions(response?.response?.data || []);
      } else {
        showToast("Failed to fetch units");
      }
    } catch (err) {
      showToast("Something went wrong while fetching units!");
    }
  };

  const fetchItemCategoryOptions = async () => {
    if (!itemDetails?.storeId) return;
    const payload = { data: { storeIds: [itemDetails.storeId] } };
    try {
      const { response, status } = await BackendRequest("/api/masters/itemCategoryMaster/getAllItemCategoryMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 200 && response?.response?.statusCode === 200) {
        setItemCategoryOptions(response?.response?.data || []);
      } else {
        showToast("Failed to fetch categories");
      }
    } catch (err) {
      showToast("Something went wrong while fetching categories!");
    }
  };

  const fetchSupplierOptions = async () => {
    if (!itemDetails?.storeId) return;
    const payload = { data: { storeIds: [itemDetails.storeId] } };
    try {
      const { response, status } = await BackendRequest("/api/masters/supplierMaster/getSuppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 200 && response?.response?.statusCode === 200) {
        setSupplierOptions(response?.response?.data || []);
      } else {
        showToast(response?.response?.message || "Failed to fetch suppliers");
      }
    } catch (err) {
      showToast("Something went wrong while fetching suppliers!");
    }
  };

  // Fetch all dropdowns
  useEffect(() => {
    if (!itemDetails?.storeId) return;
    fetchTaxMaster();
    fetchDiscountMaster();
    fetchUnitOptions();
    fetchItemCategoryOptions();
    fetchSupplierOptions();
  }, [itemDetails?.storeId]);

  // Select options
  const taxSelectOptions = taxOptions.map((tax: any) => ({
    value: tax.id,
    label: `${tax.taxCode} (${tax.taxPercentage}%)`,
  }));
  const selectedTaxes = taxSelectOptions.filter((option) =>
    formData.applicableTaxes?.includes(option.value)
  );

  const discountSelectOptions = discountOptions.map((discount: any) => ({
    value: discount.id,
    label: `${discount.discountName} - ${discount.discountCouponCode} (${discount.discountPercentage}%)`,
  }));
  const selectedDiscounts = discountSelectOptions.filter((option) =>
    formData.discountMasterIds?.includes(option.value)
  );

  const unitSelectOptions = unitOptions.map((unit: any) => ({
    value: unit.id,
    label: `${unit.unit} (${unit.unitNotation})`,
  }));
  const selectedUnits = unitSelectOptions.find((option) => option.value === formData.stockUnit);

  const itemCategorySelectOptions = itemCategoryOptions.map((category: any) => ({
    value: category.id,
    label: `${category.categoryName}`,
  }));
  const selectedCategories = itemCategorySelectOptions.filter((option) =>
    formData.categoryIds?.includes(option.value)
  );

  const supplierSelectOptions = supplierOptions.map((supplier: any) => ({
    value: supplier.id,
    label: supplier.name || supplier.supplierName,
  }));
  const selectedSupplier = supplierSelectOptions.find((option) => option.value === formData.supplierId);

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

  // Handle select changes for multi-select and single-select
  const handleSelectChange = (name: string, selectedOptions: any) => {
    const selectedValues = Array.isArray(selectedOptions)
      ? selectedOptions.map((opt) => opt.value)
      : selectedOptions?.value || "";
    setFormData((prev) => ({
      ...prev,
      [name]: selectedValues,
    }));
  };

  // Update item
  const updateItem = async (item: FormDataType = formData) => {
      const payload = {
        data: {
          ...item,
          expiryDate: item.expiryDate ? toISOStringOrNull(item.expiryDate) : ""
        }
      };
  
      try {
        console.log(payload)
        setIsSubmitting(true);
  
        const { response, status } = await BackendRequest("/api/inventoryManagement/editItem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        if (status === 201) {
          router.push("/inventoryManagement/allItems")
          showToast("Item added successfully");
        } else {
          showToast(response?.response?.message || "Failed to add item", 'error');
        }
      } catch (err) {
        showToast("Something went wrong!" + err, 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateItem(formData);
  };

  // Prevent invalid number input
  const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "."
      ];
      if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

  if (!itemDetails || !formData) {
    return <div className="text-gray-500 p-4">Loading item details...</div>;
  }

  return (
    <div className="mt-10">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-xl shadow-md max-w-5xl mx-auto space-y-6"
      >
        <h2 className="text-3xl font-bold text-purple-600">Edit {itemDetails.itemName || "Item"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Name */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter item name"
            />
          </div>

          {/* Item Brand */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Item Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter brand name"
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Cost Price</label>
            <input
              type="number"
              min={0}
              name="costPrice"
              value={formData.costPrice ?? ""}
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Base Selling Price */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Base Selling Price</label>
            <input
              type="number"
              min={0}
              name="baseSellingPrice"
              value={formData.baseSellingPrice ?? ""}
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              disabled={formData.profitToGainInPercentage !== null}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Profit to Gain (%) */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Profit to Gain (%)</label>
            <input
              type="number"
              min={0}
              name="profitToGainInPercentage"
              value={formData.profitToGainInPercentage ?? ""}
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              disabled={formData.baseSellingPrice !== null}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Additional Price */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Additional Price</label>
            <input
              type="number"
              min={0}
              name="additionalPrice"
              value={formData.additionalPrice ?? ""}
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Stock</label>
            <input
              type="number"
              name="itemStock"
              min={0}
              value={formData.itemStock ?? ""}
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Stock Threshold */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Stock Threshold</label>
            <input
              type="number"
              name="stockThreshold"
              min={0}
              value={formData.stockThreshold ?? ""}
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Barcode</label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Stock Unit */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Stock Unit</label>
            <Select
              name="stockUnit"
              options={unitSelectOptions}
              value={selectedUnits}
              onChange={(selectedOption) => handleSelectChange("stockUnit", selectedOption)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Applicable Taxes */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Applicable Taxes</label>
            <Select
              isMulti
              name="applicableTaxes"
              options={taxSelectOptions}
              value={selectedTaxes}
              onChange={(selectedOptions) => handleSelectChange("applicableTaxes", selectedOptions)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Discounts */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Discounts</label>
            <Select
              isMulti
              name="discountMasterIds"
              options={discountSelectOptions}
              value={selectedDiscounts}
              onChange={(selectedOptions) => handleSelectChange("discountMasterIds", selectedOptions)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Categories</label>
            <Select
              isMulti
              name="categoryIds"
              options={itemCategorySelectOptions}
              value={selectedCategories}
              onChange={(selectedOptions) => handleSelectChange("categoryIds", selectedOptions)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Supplier</label>
            <Select
              name="supplierId"
              options={supplierSelectOptions}
              value={selectedSupplier}
              onChange={(selectedOption) => handleSelectChange("supplierId", selectedOption)}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-10 flex-wrap pt-4">
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              name="isReturnable"
              checked={formData.isReturnable || false}
              onChange={handleChange}
              className="text-purple-600 rounded border-purple-300 focus:ring-purple-500"
            />
            Is Returnable
          </label>
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              name="isWarrantyAvailable"
              checked={formData.isWarrantyAvailable || false}
              onChange={handleChange}
              className="text-purple-600 rounded border-purple-300 focus:ring-purple-500"
            />
            Warranty Available
          </label>
        </div>

        {formData.isWarrantyAvailable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Years</label>
              <input
                type="number"
                name="warrantyPeriodYears"
                value={formData.warrantyPeriodYears ?? ""}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberInput}
                className="w-24 p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Months</label>
              <input
                type="number"
                name="warrantyPeriodMonths"
                value={formData.warrantyPeriodMonths ?? ""}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberInput}
                className="w-24 p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Days</label>
              <input
                type="number"
                name="warrantyPeriodDays"
                value={formData.warrantyPeriodDays ?? ""}
                onChange={handleChange}
                onKeyDown={preventInvalidNumberInput}
                className="w-24 p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Updating..." : "Update Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;