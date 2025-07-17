"use client";
import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useToast } from '@/context/toast-context';
import {useRouter} from 'next/navigation';

// Interface for invoice item payload sent to the backend
export interface InvoiceItemPayload {
  itemId: string;
  quantity: number;
  itemBasePrice: number;
  totalBasePrice: number;
  discountIds: string[];
  discountPerItem: number;
  totalDiscount: number;
  taxIds: string[];
  taxPerItem: number;
  totalTax: number;
  finalPricePerItem: number;
  finalPrice: number;
}

// Interface for create invoice payload
interface CreateInvoicePayload {
  invoiceItems: InvoiceItemPayload[];
  customerName: string;
  customerContactNo: string;
  discountOverTotalPrice: number;
  taxOverTotalPrice: number;
  couponCode: string;
  deliveryStatus: string;
  paymentStatus: string;
  grandTotal: number;
}

// Hook to handle invoice creation
export function useCreateInvoice() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const createInvoice = async (
    invoiceItems: InvoiceItemPayload[],
    customerName: string,
    customerContactNo: string,
    discountOverTotalPrice: number,
    taxOverTotalPrice: number,
    couponCode: string,
    deliveryStatus: string,
    paymentStatus: string,
    grandTotal: number
  ) => {
    const storeId = Cookies.get("storeId");

    const payload = {
      data: {
        invoiceItems,
        storeId,
        customerName,
        customerContactNo,
        discountOverTotalPrice,
        taxOverTotalPrice,
        couponCode,
        deliveryStatus,
        paymentStatus,
        grandTotal,
      },
    };

    console.log("Sending payload to create invoice:", payload);

    try {
      setLoading(true);
      const { response } = await BackendRequest("/api/billing/createInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = response.response;

      if (!result.error && result.status === "Success") {
        showToast("Invoice generated successfully!", "success");
        return result.data; // Return full invoice + invoiceItems
      } else {
        showToast(result.message || "Failed to generate invoice", "error");
        return null;
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      showToast("An error occurred while generating invoice", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createInvoice, loading };
}

// Interface for invoice items in the UI, aligned with API response
interface InvoiceItemsType {
  id: string;
  itemName: string;
  quantity: number;
  skuCode: string | number; // API returns number, UI treats as string
  costPrice: number;
  finalPriceForUnit: number;
  baseSellingPriceForUnit: number;
  totalTaxPriceForUnit: number;
  totalDiscountForUnit: number;
  baseSellingPrice: number;
  totalTaxPrice: number;
  totalDiscountPrice: number;
  finalPrice: number;
  isWarrantyAvailable: boolean;
  warrantyPeriod: string;
  isReturnable: boolean;
}

// Debounce hook for input throttling
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const AddInvoiceItems: React.FC = () => {
  const { createInvoice, loading } = useCreateInvoice();
  const [itemName, setItemName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContactNo, setCustomerContactNo] = useState('');
  const [discountOverTotalPrice, setDiscountOverTotalPrice] = useState('0');
  const [taxOverTotalPrice, setTaxOverTotalPrice] = useState('0');
  const [couponCode, setCouponCode] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemsType[]>([]);
  const [itemOptions, setItemOptions] = useState<InvoiceItemsType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const itemNameInputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedItemName = useDebounce(itemName, 100);
  const debouncedBarcode = useDebounce(barcode, 300);
  const debouncedSkuCode = useDebounce(skuCode, 700);
  const { showToast } = useToast();
  const router = useRouter();

  const storeId = Cookies.get("storeId");

  // Calculate grand total
  const grandTotal = invoiceItems.reduce((sum, item) => sum + item.finalPrice, 0);

  // Fetch items by name for autocomplete
  useEffect(() => {
    const fetchItemName = async () => {
      if (!debouncedItemName.trim()) {
        setItemOptions([]);
        setShowSuggestions(false);
        return;
      }

      const payload = { data: { storeId, itemName: debouncedItemName } };

      try {
        const { response, status } = await BackendRequest(
          `/api/inventoryManagement/getItemByNameSkuBarcode`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if(status !== 200 && response.status !== 200){
            router.push("/")
            showToast("Session expired, please login", "error");
        }

        const items = response.response.data;
        if (Array.isArray(items)) {
          setItemOptions(items.map(item => ({
            ...item,
            skuCode: String(item.skuCode), // Convert to string for UI
            quantity: 1,
            baseSellingPriceForUnit: item.baseSellingPrice,
            totalTaxPriceForUnit: item.totalTaxPrice,
            totalDiscountForUnit: item.totalDiscountPrice,
            finalPriceForUnit: item.finalPrice,
          })));
          setShowSuggestions(true);
        } else {
          setItemOptions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("Error fetching itemName items:", err);
        setItemOptions([]);
        setShowSuggestions(false);
      }
    };

    fetchItemName();
  }, [debouncedItemName, storeId]);

  // Fetch items by barcode or SKU code
  useEffect(() => {
    const fetchByCode = async () => {
      const value = debouncedBarcode || debouncedSkuCode;
      const field = debouncedBarcode ? "barcode" : "skuCode";

      if (!value.trim()) return;

      const payload: any = { data: { storeId } };
      payload.data[field] = value;

      try {
        const { response, status } = await BackendRequest(
          `/api/inventoryManagement/getItemByNameSkuBarcode`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if(status !== 200 && response.status !== 200){
            router.push("/")
            showToast("Session expired, please login", "error");
        }

        const items = response.response.data;

        if (Array.isArray(items) && items.length === 1) {
          const newItem = items[0];
          setInvoiceItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === newItem.id);

            if (existingIndex !== -1) {
              const updatedItems = [...prev];
              const currentItem = updatedItems[existingIndex];
              const quantity = currentItem.quantity + 1;

              updatedItems[existingIndex] = {
                ...currentItem,
                quantity,
                baseSellingPriceForUnit: currentItem.baseSellingPriceForUnit || newItem.baseSellingPrice,
                totalTaxPrice: (currentItem.totalTaxPriceForUnit || newItem.totalTaxPrice) * quantity,
                totalDiscountPrice: (currentItem.totalDiscountForUnit || newItem.totalDiscountPrice) * quantity,
                finalPrice: (currentItem.finalPriceForUnit || newItem.finalPrice) * quantity,
              };

              return updatedItems;
            } else {
              return [
                ...prev,
                {
                  ...newItem,
                  skuCode: String(newItem.skuCode), // Convert to string for UI
                  quantity: 1,
                  baseSellingPriceForUnit: newItem.baseSellingPrice,
                  totalTaxPriceForUnit: newItem.totalTaxPrice,
                  totalDiscountForUnit: newItem.totalDiscountPrice,
                  finalPriceForUnit: newItem.finalPrice,
                  baseSellingPrice: newItem.baseSellingPrice,
                  totalTaxPrice: newItem.totalTaxPrice,
                  totalDiscountPrice: newItem.totalDiscountPrice,
                  finalPrice: newItem.finalPrice,
                },
              ];
            }
          });

          setItemOptions([]);
          setItemName("");
          setBarcode("");
          setSkuCode("");
        }
      } catch (err) {
        console.error("Error fetching barcode/skuCode items:", err);
      }
    };

    if (debouncedBarcode || debouncedSkuCode) {
      fetchByCode();
    }
  }, [debouncedBarcode, debouncedSkuCode, storeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'itemName') setItemName(value);
    if (name === 'barcode') setBarcode(value);
    if (name === 'skuCode') setSkuCode(value);
    if (name === 'customerName') setCustomerName(value);
    if (name === 'customerContactNo') setCustomerContactNo(value);
    if (name === 'discountOverTotalPrice') setDiscountOverTotalPrice(value);
    if (name === 'taxOverTotalPrice') setTaxOverTotalPrice(value);
    if (name === 'couponCode') setCouponCode(value);
  };

  const handleSelectItem = (item: InvoiceItemsType) => {
    setInvoiceItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);

      if (existingIndex !== -1) {
        const updatedItems = [...prev];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
          totalTaxPrice: (updatedItems[existingIndex].totalTaxPriceForUnit || 0) * (updatedItems[existingIndex].quantity + 1),
          totalDiscountPrice: (updatedItems[existingIndex].totalDiscountForUnit || 0) * (updatedItems[existingIndex].quantity + 1),
          finalPrice: (updatedItems[existingIndex].finalPriceForUnit || 0) * (updatedItems[existingIndex].quantity + 1),
        };
        return updatedItems;
      } else {
        return [
          ...prev,
          {
            ...item,
            quantity: 1,
            baseSellingPriceForUnit: item.baseSellingPrice,
            totalTaxPriceForUnit: item.totalTaxPrice,
            totalDiscountForUnit: item.totalDiscountPrice,
            finalPriceForUnit: item.finalPrice,
          },
        ];
      }
    });

    setItemName('');
    setItemOptions([]);
    setShowSuggestions(false);
    setTimeout(() => itemNameInputRef.current?.focus(), 0);
  };

  const handleIncrement = (itemId: string) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== itemId) return item;

        const quantity = item.quantity + 1;
        const taxPerUnit = item.totalTaxPriceForUnit ?? (item.totalTaxPrice / item.quantity) ?? 0;
        const discountPerUnit = item.totalDiscountForUnit ?? (item.totalDiscountPrice / item.quantity) ?? 0;
        const finalPricePerUnit = item.finalPriceForUnit ?? (item.finalPrice / item.quantity) ?? 0;

        return {
          ...item,
          quantity,
          totalTaxPrice: taxPerUnit * quantity,
          totalDiscountPrice: discountPerUnit * quantity,
          finalPrice: finalPricePerUnit * quantity,
          totalTaxPriceForUnit: taxPerUnit,
          totalDiscountForUnit: discountPerUnit,
          finalPriceForUnit: finalPricePerUnit,
        };
      })
    );
  };

  const handleDecrement = (itemId: string) => {
    setInvoiceItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId && item.quantity > 1
            ? {
                ...item,
                quantity: item.quantity - 1,
                totalTaxPrice: (item.totalTaxPriceForUnit || 0) * (item.quantity - 1),
                totalDiscountPrice: (item.totalDiscountForUnit || 0) * (item.quantity - 1),
                finalPrice: (item.finalPriceForUnit || 0) * (item.quantity - 1),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || itemOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex < itemOptions.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : itemOptions.length - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < itemOptions.length) {
          handleSelectItem(itemOptions[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const handleDelete = (itemId: string) => {
    setInvoiceItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleCreateInvoice = async () => {
    if (invoiceItems.length === 0) {
      showToast('Please add at least one item to the invoice.');
      return;
    }

    // Validate discountOverTotalPrice and taxOverTotalPrice
    const discount = parseFloat(discountOverTotalPrice) || 0;
    const tax = parseFloat(taxOverTotalPrice) || 0;
    if (isNaN(discount) || discount < 0) {
      showToast('Please enter a valid discount over total price.', "warn");
      return;
    }
    if (isNaN(tax) || tax < 0) {
      showToast('Please enter a valid tax over total price.', "warn");
      return;
    }

    const formattedInvoiceItems: InvoiceItemPayload[] = invoiceItems.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
      itemBasePrice: Number.parseFloat(item.baseSellingPriceForUnit.toFixed(2)),
      totalBasePrice: Number.parseFloat((item.baseSellingPriceForUnit * item.quantity).toFixed(2)),
      discountIds: [],
      discountPerItem: Number.parseFloat((item.totalDiscountForUnit || 0).toFixed(2)),
      totalDiscount: Number.parseFloat(((item.totalDiscountForUnit || 0) * item.quantity).toFixed(2)),
      taxIds: [],
      taxPerItem: Number.parseFloat((item.totalTaxPriceForUnit || 0).toFixed(2)),
      totalTax: Number.parseFloat(((item.totalTaxPriceForUnit || 0) * item.quantity).toFixed(2)),
      finalPricePerItem: Number.parseFloat((item.finalPriceForUnit || 0).toFixed(2)),
      finalPrice: Number.parseFloat(item.finalPrice.toFixed(2)),
    }));

    try {
      const result = await createInvoice(
        formattedInvoiceItems,
        customerName,
        customerContactNo,
        discount,
        tax,
        couponCode,
        'Not Delivered',
        'Pending',
        Number.parseFloat(grandTotal.toFixed(2))
      );

      if (result) {
        setCustomerName('');
        setCustomerContactNo('');
        setDiscountOverTotalPrice('0');
        setTaxOverTotalPrice('0');
        setCouponCode('');
        setInvoiceItems([]);
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      showToast('Failed to create invoice. Please try again.', "error");
    }
  };

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-purple-600">Add Invoice Items</h1>
      </div>

      <div className="max-w-8xl mx-auto p-8 shadow-md rounded-2xl space-y-6">
        <div className="flex gap-5">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Barcode</label>
            <input
              type="text"
              name="barcode"
              value={barcode}
              onChange={handleChange}
              autoFocus
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">SKU Code</label>
            <input
              type="text"
              name="skuCode"
              value={skuCode}
              onChange={handleChange}
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="relative w-full">
            <label className="block text-sm font-medium text-purple-700 mb-1">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={itemName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              ref={itemNameInputRef}
              autoComplete="off"
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {showSuggestions && itemOptions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-purple-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                {itemOptions.map((item, index) => (
                  <li
                    key={item.id}
                    onMouseDown={() => handleSelectItem(item)}
                    className={`px-4 py-2 cursor-pointer hover:bg-purple-100 ${index === highlightedIndex ? 'bg-purple-200' : ''}`}
                  >
                    {item.itemName} (SKU: {item.skuCode})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <table className="w-full border border-gray-300 text-black mt-6">
        <thead className="bg-purple-200">
          <tr>
            <th className="border px-4 py-2">Serial</th>
            <th className="border px-4 py-2">SKU</th>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Warranty</th>
            <th className="border px-4 py-2">Returnable</th>
            <th className="border px-4 py-2">Unit Price</th>
            <th className="border px-4 py-2">Tax</th>
            <th className="border px-4 py-2">Discount</th>
            <th className="border px-4 py-2">Unit Final Price</th>
            <th className="border px-4 py-2">Final Price (₹)</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoiceItems.length > 0 ? (
            invoiceItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-purple-100">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{item.skuCode}</td>
                <td className="border px-4 py-2">{item.itemName}</td>
                <td className="border px-4 py-2">{item.quantity}</td>
                <td className="border px-4 py-2">{item.isWarrantyAvailable ? "Yes" : "No"} - {item.warrantyPeriod}</td>
                <td className="border px-4 py-2">{item.isReturnable ? "Yes" : "No"}</td>
                <td className="border px-4 py-2">₹{item.baseSellingPriceForUnit.toFixed(2)}</td>
                <td className="border px-4 py-2">₹{(item.totalTaxPriceForUnit || 0).toFixed(2)}</td>
                <td className="border px-4 py-2">₹{(item.totalDiscountForUnit || 0).toFixed(2)}</td>
                <td className="border px-4 py-2">₹{(item.finalPriceForUnit || 0).toFixed(2)}</td>
                <td className="border px-4 py-2">₹{item.finalPrice.toFixed(2)}</td>
                <td className="border px-4 py-2 flex gap-2 items-center justify-center">
                  <button
                    onClick={() => handleDecrement(item.id)}
                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={loading}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item.id)}
                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={loading}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-2 text-red-500 hover:underline"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12} className="text-center p-4">No items added</td>
            </tr>
          )}
        </tbody>
      </table>

      {invoiceItems.length > 0 && (
        <table className="w-full border border-gray-300 text-black mt-6">
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-medium">Tax over total price</td>
              <td className="border px-4 py-2" colSpan={11}>₹{Number.parseFloat(taxOverTotalPrice || '0').toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-medium">Discount over total price</td>
              <td className="border px-4 py-2" colSpan={11}>₹{Number.parseFloat(discountOverTotalPrice || '0').toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-medium">Grand Total</td>
              <td className="border px-4 py-2" colSpan={11}>₹{grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="max-w-8xl mx-auto p-8 shadow-md rounded-2xl space-y-6">
        <div className="flex gap-5">
          <div className="w-full">
            <label className="block text-sm font-medium text-purple-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={customerName}
              onChange={handleChange}
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter customer name (optional)"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-purple-700 mb-1">Contact Number</label>
            <input
              type="tel"
              name="customerContactNo"
              value={customerContactNo}
              onChange={handleChange}
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter contact number (optional)"
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </div>
        </div>
        <div className="flex gap-5">
          <div className="w-full">
            <label className="block text-sm font-medium text-purple-700 mb-1">Discount Over Total Price</label>
            <input
              type="number"
              name="discountOverTotalPrice"
              value={discountOverTotalPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter discount over total price"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Over Total Price</label>
            <input
              type="number"
              name="taxOverTotalPrice"
              value={taxOverTotalPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter tax over total price"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-purple-700 mb-1">Coupon Code</label>
            <input
              type="text"
              name="couponCode"
              value={couponCode}
              onChange={handleChange}
              className="w-full p-2 border border-purple-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter coupon code (optional)"
            />
          </div>
        </div>
      </div>

      <button
        className="float-right mt-5 mb-10 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300"
        onClick={handleCreateInvoice}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Invoice"}
      </button>
    </div>
  );
};

export default AddInvoiceItems;