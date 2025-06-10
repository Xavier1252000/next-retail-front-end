"use client";
import React, { useEffect, useState } from 'react'
import { useToast } from '@/context/toast-context'
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor'

export interface ItemDetailsProps {
  itemId: string
}

export interface ItemDetailsResponse {
  id: string
  storeId: string
  itemName: string
  skuCode: number
  costPrice: number
  profitToGainInPercentage: number
  baseSellingPrice: number
  additionalPrice: number
  totalTaxPrice: number
  totalDiscountPrice: number
  finalPrice: number
  profitMargin: number
  markupPercentage: number
  brand: string
  categoryIds: string[]
  supplierId: string
  description: string
  itemImageInfoIds: string[]
  itemStock: number
  stockThreshold: number | null
  tutorialLinks: string[]
  barcode: string
  stockUnit: string
  stockUnitId: string
  thresholdQuantityForAddTax: number | null
  isReturnable: boolean
  isWarrantyAvailable: boolean
  warrantyPeriod: string
  warrantyYears: number,
  warrantyMonths: number,
  warrantyDays: number
  expiryDate: string | null
  applicableTaxes: any[] // You can define a more specific type if needed
  applicableDiscounts: any[] // You can define a more specific type if needed
  createdBy: string
  createdById: string
  modifiedBy: string
  modifiedById: string
}


const ItemDetails: React.FC<ItemDetailsProps> = ({ itemId }) => {
  const [itemDetails, setItemDetails] = useState<ItemDetailsResponse>();
  const { showToast } = useToast()

  const payload = {
    data: {
      itemId,
    },
  }

  const fetchItemDetails = async () => {
    console.log(payload);
    try {
      const { response, status } = await BackendRequest("/api/inventoryManagement/itemDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (status === 200 || response?.response?.statusCode === 200) {
        setItemDetails(response?.response?.data)
        showToast("Item Details fetched successfully")
      } else {
        showToast(response?.response?.message || "Failed to fetch item")
      }
    } catch (err) {
      showToast("Something went wrong!" + err)
    }
  }

  useEffect(() => {
    fetchItemDetails()
  }, [])

  if (!itemDetails) return <div className="text-gray-500 p-4">Loading item details...</div>

  return (
  <div className="p-8 max-w-5xl mx-auto mt-10">
    <h2 className="text-3xl font-semibold text-purple-800 mb-8 border-b-2 border-purple-300 pb-2">
      Item Details
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
      <Detail label="Store ID" value={itemDetails.storeId} />
      <Detail label="Item ID" value={itemDetails.id} />
      <Detail label="Item Name" value={itemDetails.itemName} />
      <Detail label="SKU Code" value={itemDetails.skuCode} />
      <Detail label="Cost Price" value={itemDetails.costPrice} />
      <Detail label="Profit to Gain (%)" value={itemDetails.profitToGainInPercentage} />
      <Detail label="Base Selling Price" value={itemDetails.baseSellingPrice} />
      <Detail label="Additional Price" value={itemDetails.additionalPrice} />
      <Detail label="Total Tax Price" value={itemDetails.totalTaxPrice} />
      <Detail label="Total Discount Price" value={itemDetails.totalDiscountPrice} />
      <Detail label="Final Price" value={itemDetails.finalPrice} />
      <Detail label="Profit Margin" value={itemDetails.profitMargin} />
      <Detail label="Markup (%)" value={itemDetails.markupPercentage} />
      <Detail label="Brand" value={itemDetails.brand || "N/A"} />
      <Detail label="Category IDs" value={itemDetails.categoryIds.length ? itemDetails.categoryIds.join(", ") : "N/A"} />
      <Detail label="Supplier ID" value={itemDetails.supplierId || "N/A"} />
      <Detail label="Description" value={itemDetails.description || "N/A"} />
      <Detail label="Item Image Info IDs" value={itemDetails.itemImageInfoIds.length ? itemDetails.itemImageInfoIds.join(", ") : "N/A"} />
      <Detail label="Item Stock" value={itemDetails.itemStock} />
      <Detail label="Stock Threshold" value={itemDetails.stockThreshold ?? "N/A"} />
      <Detail label="Tutorial Links" value={itemDetails.tutorialLinks.length ? itemDetails.tutorialLinks.join(", ") : "N/A"} />
      <Detail label="Barcode" value={itemDetails.barcode || "N/A"} />
      <Detail label="Stock Unit" value={itemDetails.stockUnit} />
      <Detail label="Stock Unit ID" value={itemDetails.stockUnitId} />
      <Detail label="Threshold Qty for Tax" value={itemDetails.thresholdQuantityForAddTax ?? "N/A"} />
      <Detail label="Is Returnable" value={itemDetails.isReturnable ? "Yes" : "No"} />
      <Detail label="Warranty Available" value={itemDetails.isWarrantyAvailable ? "Yes" : "No"} />
      <Detail label="Warranty" value={itemDetails.warrantyPeriod}  />
      <Detail label="Expiry Date" value={itemDetails.expiryDate ?? "N/A"} />
      <Detail label="Created By" value={itemDetails.createdBy} />
      <Detail label="Created By ID" value={itemDetails.createdById} />
      <Detail label="Modified By" value={itemDetails.modifiedBy} />
      <Detail label="Modified By ID" value={itemDetails.modifiedById} />
    </div>

    {/* Tax Section */}
    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-purple-700 border-b border-purple-300 pb-2 mb-6">Applicable Tax Details</h3>
      {itemDetails.applicableTaxes && itemDetails.applicableTaxes.length > 0 ? (
        <div className="space-y-6">
          {itemDetails.applicableTaxes.map((tax, index) => (
            <div key={index} className="border border-purple-300 rounded-md shadow-sm p-6">
              <h4 className="text-lg font-semibold text-purple-600 mb-4">Tax #{index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Detail label="Tax ID" value={tax.id ?? "N/A"} />
                <Detail label="Store IDs" value={tax.storeIds?.length ? tax.storeIds.join(', ') : "N/A"} />
                <Detail label="Tax Code" value={tax.taxCode ?? "N/A"} />
                <Detail label="Tax Type" value={tax.taxType ?? "N/A"} />
                <Detail label="Tax Percentage" value={tax.taxPercentage != null ? `${tax.taxPercentage}%` : "N/A"} />
                <Detail label="Applicable On" value={tax.applicableOn ?? "N/A"} />
                <Detail label="Applicable Categories" value={tax.applicableCategories?.length ? tax.applicableCategories.join(', ') : "N/A"} />
                <Detail label="Included in Base Price" value={tax.inclusionOnBasePrice ? "Yes" : "No"} />
                <Detail label="Description" value={tax.description ?? "N/A"} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Detail label="Applicable Taxes" value="N/A" />
      )}
    </div>

    {/* Discount Section */}
    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-purple-700 border-b border-purple-300 pb-2 mb-6">Applicable Discount Details</h3>
      {itemDetails.applicableDiscounts && itemDetails.applicableDiscounts.length > 0 ? (
        <div className="space-y-6">
          {itemDetails.applicableDiscounts.map((discount, index) => (
            <div key={index} className="border border-purple-300 rounded-md shadow-sm p-6">
              <h4 className="text-lg font-semibold text-purple-600 mb-4">Discount #{index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Detail label="Discount ID" value={discount.id ?? "N/A"} />
                <Detail label="Store IDs" value={discount.storeIds?.length ? discount.storeIds.join(', ') : "N/A"} />
                <Detail label="Discount Name" value={discount.discountName ?? "N/A"} />
                <Detail label="Discount Percentage" value={discount.discountPercentage != null ? `${discount.discountPercentage}%` : "N/A"} />
                <Detail label="Discount Amount" value={discount.discountAmount != null ? `$${discount.discountAmount}` : "N/A"} />
                <Detail label="Applicable On" value={discount.applicableOn ?? "N/A"} />
                <Detail label="Coupon Code" value={discount.discountCouponCode ?? "N/A"} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Detail label="Applicable Discounts" value="N/A" />
      )}
    </div>

    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
      <button className="px-5 py-2 rounded-md border border-purple-500 text-purple-600 hover:bg-purple-100 transition">
        Back
      </button>
      <button className="px-5 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition">
        Edit
      </button>
    </div>
  </div>
);
}

const Detail = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-900 mt-1 break-words">{value}</p>
  </div>
)

export default ItemDetails
