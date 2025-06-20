"use client";

import React from "react";
import { UseAddItems } from "./useAddItems";
import Select from "react-select";
import { motion } from "framer-motion";

const AddItemForm = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    taxOptions,
    discountOptions,
    itemCategoryOptions,
    supplierOptions,
    preventInvalidNumberInput,
    unitOptions
  } = UseAddItems();


  // taxMasters
  const taxSelectOptions = taxOptions.map((tax: any) => ({
    value: tax.id,
    label: `${tax.taxCode} (${tax.taxPercentage}%)`,
  }));


  // Convert formData.applicableTaxes (IDs) to selected option objects
  const selectedTaxes = taxSelectOptions.filter((option) =>
    formData.applicableTaxes?.includes(option.value)
  );

  // discount
  const discountSelectOptions = discountOptions.map((discount: any) => ({
    value: discount.id,
    label: `${discount.discountName} - ${discount.discountCouponCode} (${discount.discountPercentage})`
  }));

  // selected discount options
  const selectedDiscount = discountSelectOptions.filter((option) =>
    formData.discountMasterIds?.includes(option.value)
  );

  // unit
  const unitSelectOptions = unitOptions.map((unit: any) => ({
    value: unit.id,
    label: `${unit.unit} (${unit.unitNotation})`
  }));

  // selected unit options
  const selectedUnits = unitSelectOptions.find(
    (option) => option.value === formData.stockUnit
  );

  // itemCategory
  const itemCategorySelectOptions = itemCategoryOptions.map((category: any) => ({
    value: category.id,
    label: `${category.categoryName}`
  }));

  // selected category options
  const selectedCategories = itemCategorySelectOptions.filter(
    (option) => formData.categoryIds?.includes(option.value)
  );


  return (
    <div className="mt-10">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-xl shadow-md max-w-5xl mx-auto space-y-6"
      >
        <h2 className="text-3xl font-bold text-purple-600">Add New Item</h2>

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
              placeholder="Enter item name"
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Cost Price</label>
            <input
              type="number"
              name="costPrice"
              min={0}
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
              onChange={(selectedOption) => {
                handleChange({
                  target: {
                    name: 'stockUnit',
                    value: selectedOption?.value || '',
                  },
                });
              }}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Applicable Taxes */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Applicable Taxes</label>
            <Select
              isMulti
              options={taxSelectOptions}
              name="applicableTaxes"
              value={selectedTaxes}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions.map((opt) => opt.value);
                handleChange({
                  target: {
                    name: "applicableTaxes",
                    value: selectedValues,
                  },
                });
              }}
              className="react-select-container"
              classNamePrefix="react-select" />
          </div>



          {/* Discounts */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Discounts</label>
            <Select
              name="discountMasterIds"
              isMulti
              options={discountSelectOptions}
              value={selectedDiscount}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions.map((opt) => opt.value);
                handleChange({
                  target: {
                    name: "discountMasterIds",
                    value: selectedValues,
                  },
                });
              }}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>



          {/* Categories */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Categories</label>
            <Select
              name="categoryIds"
              isMulti
              options={itemCategorySelectOptions}
              value={selectedCategories}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions.map((opt) => opt.value);
                handleChange({
                  target: {
                    name: "categoryIds",
                    value: selectedValues,
                  },
                });
              }}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Supplier</label>
            <select
              name="supplierId"
              value={formData.supplierId || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Supplier</option>
              {supplierOptions.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-4">
            <div className="flex flex-wrap gap-4">
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
            </div>
          </motion.div>
        )}


        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 "
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  );

};

export default AddItemForm;
