"use client";

import React from "react";
import { UseAddItems } from "./useAddItems";

const AddItemForm = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    taxOptions,
    discountOptions,
    categoryOptions,
    supplierOptions,
    preventInvalidNumberInput,
  } = UseAddItems();

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl shadow-md max-w-4xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-semibold text-purple-600">Add New Item</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
          <input
            type="number"
            name="costPrice"
            value={formData.costPrice ?? ""}
            onChange={handleChange}
            onKeyDown={preventInvalidNumberInput}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Base Selling Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Base Selling Price</label>
          <input
            type="number"
            name="baseSellingPrice"
            value={formData.baseSellingPrice ?? ""}
            onChange={handleChange}
            onKeyDown={preventInvalidNumberInput}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Profit to Gain (%) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Profit to Gain (%)</label>
          <input
            type="number"
            name="profitToGainInPercentage"
            value={formData.profitToGainInPercentage ?? ""}
            onChange={handleChange}
            onKeyDown={preventInvalidNumberInput}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Additional Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Price</label>
          <input
            type="number"
            name="additionalPrice"
            value={formData.additionalPrice ?? ""}
            onChange={handleChange}
            onKeyDown={preventInvalidNumberInput}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            name="itemStock"
            value={formData.itemStock ?? ""}
            onChange={handleChange}
            onKeyDown={preventInvalidNumberInput}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Stock Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Threshold</label>
          <input
            type="number"
            name="stockThreshold"
            value={formData.stockThreshold ?? ""}
            onChange={handleChange}
            onKeyDown={preventInvalidNumberInput}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* SKU Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU Code</label>
          <input
            type="text"
            name="skuCode"
            value={formData.skuCode || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Barcode */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Barcode</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Stock Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Unit</label>
          <input
            type="text"
            name="stockUnit"
            value={formData.stockUnit || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Multi-selects Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Applicable Taxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Applicable Taxes</label>
          <select
            name="applicableTaxes"
            multiple
            value={formData.applicableTaxes || []}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 h-28"
          >
            {taxOptions.map((tax: any) => (
              <option key={tax.id} value={tax.id}>
                {tax.name}
              </option>
            ))}
          </select>
        </div>

        {/* Discounts */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Discounts</label>
          <select
            name="discountMasterIds"
            multiple
            value={formData.discountMasterIds || []}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 h-28"
          >
            {discountOptions.map((discount: any) => (
              <option key={discount.id} value={discount.id}>
                {discount.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Categories</label>
          <select
            name="categoryIds"
            multiple
            value={formData.categoryIds || []}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 h-28"
          >
            {categoryOptions.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier</label>
          <select
            name="supplierId"
            value={formData.supplierId || ""}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="">Select Supplier</option>
            {supplierOptions.map((supplier: any) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isReturnable"
            checked={formData.isReturnable || false}
            onChange={handleChange}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span>Is Returnable</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isWarrantyAvailable"
            checked={formData.isWarrantyAvailable || false}
            onChange={handleChange}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span>Warranty Available</span>
        </label>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-purple-600 text-white px-6 py-2 rounded-xl shadow hover:bg-purple-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Add Item"}
        </button>
      </div>
    </form>
  );
};

export default AddItemForm;
