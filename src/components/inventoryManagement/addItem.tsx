"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UseAddItems } from "./useAddItems";

const AddItemForm = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    preventInvalidNumberInput,
  } = UseAddItems();

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="itemName">Item Name</Label>
          <Input
            id="itemName"
            name="itemName"
            value={formData.itemName ?? ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input
            id="costPrice"
            name="costPrice"
            type="text"
            inputMode="decimal"
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.costPrice ?? ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="baseSellingPrice">Base Selling Price</Label>
          <Input
            id="baseSellingPrice"
            name="baseSellingPrice"
            type="text"
            inputMode="decimal"
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.baseSellingPrice ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="profitToGainInPercentage">Profit %</Label>
          <Input
            id="profitToGainInPercentage"
            name="profitToGainInPercentage"
            type="text"  // changed from number to text
            inputMode="decimal"  // mobile keyboards show numbers and dot
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.profitToGainInPercentage ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="profitToGainInPercentage">Packaging and Service charge</Label>
          <Input
            id="additionalPrice"
            name="additionalPrice"
            type="text"  // changed from number to text
            inputMode="decimal"  // mobile keyboards show numbers and dot
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.additionalPrice ?? ""}
            onChange={handleChange}
          />
        </div>



        <div>
          <Label htmlFor="itemStock">Stock</Label>
          <Input
            id="itemStock"
            name="itemStock"
            min={0}
            inputMode="decimal"
            onKeyDown={preventInvalidNumberInput}
            value={formData.itemStock ?? ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="stockThreshold">Stock Threshold</Label>
          <Input
            id="stockThreshold"
            name="stockThreshold"
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.stockThreshold ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="stockUnit">Stock Unit</Label>
          <Input
            id="stockUnit"
            name="stockUnit"
            value={formData.stockUnit ?? ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="skuCode">SKU Code</Label>
          <Input
            id="skuCode"
            name="skuCode"
            value={formData.skuCode ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            name="barcode"
            value={formData.barcode ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description ?? ""}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isReturnable"
            name="isReturnable"
            checked={formData.isReturnable ?? false}
            onCheckedChange={(val) =>
              handleChange({
                target: {
                  name: "isReturnable",
                  type: "checkbox",
                  checked: Boolean(val),
                } as any,
              })
            }
          />
          <Label htmlFor="isReturnable">Returnable</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isWarrantyAvailable"
            name="isWarrantyAvailable"
            checked={formData.isWarrantyAvailable ?? false}
            onCheckedChange={(val) =>
              handleChange({
                target: {
                  name: "isWarrantyAvailable",
                  type: "checkbox",
                  checked: Boolean(val),
                } as any,
              })
            }
          />
          <Label htmlFor="isWarrantyAvailable">Warranty</Label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="warrantyPeriodYears">Warranty (Years)</Label>
          <Input
            id="warrantyPeriodYears"
            name="warrantyPeriodYears"
            type="number"
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.warrantyPeriodYears ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="warrantyPeriodMonths">Months</Label>
          <Input
            id="warrantyPeriodMonths"
            name="warrantyPeriodMonths"
            type="number"
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.warrantyPeriodMonths ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="warrantyPeriodDays">Days</Label>
          <Input
            id="warrantyPeriodDays"
            name="warrantyPeriodDays"
            type="number"
            min={0}
            onKeyDown={preventInvalidNumberInput}
            value={formData.warrantyPeriodDays ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input
          id="expiryDate"
          name="expiryDate"
          type="date"
          value={
            formData.expiryDate
              ? new Date(formData.expiryDate).toISOString()
              : ""
          }
          onChange={(e) =>
            handleChange({
              target: {
                ...e.target,
                value: e.target.value ? new Date(e.target.value).toISOString() : null,
              },
            })
          }
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Add Item"}
      </Button>
    </form>
  );
};

export default AddItemForm;