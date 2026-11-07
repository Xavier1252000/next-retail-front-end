"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useToast } from '@/context/toast-context';
import { useRouter } from 'next/navigation';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  ShoppingCart,
  User,
  Phone,
  Tag,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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

export interface TaxBreakdownItem {
  taxId: string;
  taxCode: string;
  taxType: string;
  taxPercentage: number;
  calculatedTaxAmount: number;
  inclusionOnBasePrice?: boolean;
}

export interface DiscountBreakdownItem {
  discountId: string;
  discountName: string;
  couponCode: string;
  discountPercentage: number;
  calculatedDiscountAmount: number;
}

export interface InvoiceItemUI {
  id: string;
  itemName: string;
  skuCode: string | number;
  barcode?: string;
  quantity: number;
  costPrice: number;
  baseSellingPrice: number; // Unit base price
  totalBasePrice: number;
  totalTaxPrice: number; // For line item
  totalDiscountPrice: number; // For line item
  finalPrice: number; // Line item final price
  taxIds: string[];
  discountIds: string[];
  taxBreakdown?: TaxBreakdownItem[];
  discountBreakdown?: DiscountBreakdownItem[];
  isWarrantyAvailable?: boolean;
  warrantyPeriod?: string;
  isReturnable?: boolean;
}

export function useCreateInvoice() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

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
        generationType: "Off Line"
      },
    };

    try {
      setLoading(true);
      const { response, status } = await BackendRequest("/api/billing/createInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = response?.response;

      if (!result?.error && (status === 201 || status === 200)) {
        showToast("Invoice generated successfully!", "success");
        if (result?.data?.invoice?.id) {
          router.push("/billing/invoice/" + result.data.invoice.id);
        }
        return result;
      } else {
        showToast(result?.message || "Failed to generate invoice", "error");
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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AddInvoiceItems() {
  const { createInvoice, loading } = useCreateInvoice();
  const [itemName, setItemName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContactNo, setCustomerContactNo] = useState('');
  const [discountOverTotalPrice, setDiscountOverTotalPrice] = useState('0');
  const [taxOverTotalPrice, setTaxOverTotalPrice] = useState('0');
  const [couponCode, setCouponCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [deliveryStatus, setDeliveryStatus] = useState('Delivered');

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemUI[]>([]);
  const [itemOptions, setItemOptions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const itemNameInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const debouncedItemName = useDebounce(itemName, 150);
  const debouncedBarcode = useDebounce(barcode, 300);
  const debouncedSkuCode = useDebounce(skuCode, 400);

  const { showToast } = useToast();
  const storeId = Cookies.get("storeId");

  // Dynamic real-time totals computation
  const { subtotalBase, totalTaxes, totalDiscounts, itemsFinalTotal, grandTotal } = useMemo(() => {
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.totalBasePrice, 0);
    const taxes = invoiceItems.reduce((acc, item) => acc + item.totalTaxPrice, 0);
    const discounts = invoiceItems.reduce((acc, item) => acc + item.totalDiscountPrice, 0);
    const finalItems = invoiceItems.reduce((acc, item) => acc + item.finalPrice, 0);

    const invoiceDiscount = parseFloat(discountOverTotalPrice) || 0;
    const invoiceTax = parseFloat(taxOverTotalPrice) || 0;

    const total = Math.max(0, finalItems - invoiceDiscount + invoiceTax);

    return {
      subtotalBase: subtotal,
      totalTaxes: taxes,
      totalDiscounts: discounts,
      itemsFinalTotal: finalItems,
      grandTotal: total,
    };
  }, [invoiceItems, discountOverTotalPrice, taxOverTotalPrice]);

  // Dynamic recalculator helper for an item given a quantity
  const calculateLineItem = (baseItem: any, qty: number): InvoiceItemUI => {
    const baseSellingPrice = baseItem.baseSellingPrice || 0;
    const totalBasePrice = baseSellingPrice * qty;

    // Calculate taxes dynamically based on taxBreakdown percentages or totalTaxPrice
    let unitTax = 0;
    if (baseItem.taxBreakdown && Array.isArray(baseItem.taxBreakdown) && baseItem.taxBreakdown.length > 0) {
      unitTax = baseItem.taxBreakdown.reduce((sum: number, tb: TaxBreakdownItem) => {
        const rate = tb.taxPercentage || 0;
        return sum + (baseSellingPrice * rate) / 100;
      }, 0);
    } else if (baseItem.totalTaxPrice != null) {
      unitTax = baseItem.totalTaxPrice;
    }

    // Calculate discounts dynamically
    let unitDiscount = 0;
    if (baseItem.discountBreakdown && Array.isArray(baseItem.discountBreakdown) && baseItem.discountBreakdown.length > 0) {
      unitDiscount = baseItem.discountBreakdown.reduce((sum: number, db: DiscountBreakdownItem) => {
        const rate = db.discountPercentage || 0;
        return sum + (baseSellingPrice * rate) / 100;
      }, 0);
    } else if (baseItem.totalDiscountPrice != null) {
      unitDiscount = baseItem.totalDiscountPrice;
    }

    const totalTaxPrice = unitTax * qty;
    const totalDiscountPrice = unitDiscount * qty;
    const finalPrice = totalBasePrice + totalTaxPrice - totalDiscountPrice;

    return {
      id: baseItem.id,
      itemName: baseItem.itemName,
      skuCode: baseItem.skuCode,
      barcode: baseItem.barcode,
      quantity: qty,
      costPrice: baseItem.costPrice || 0,
      baseSellingPrice: baseSellingPrice,
      totalBasePrice: Number.parseFloat(totalBasePrice.toFixed(2)),
      totalTaxPrice: Number.parseFloat(totalTaxPrice.toFixed(2)),
      totalDiscountPrice: Number.parseFloat(totalDiscountPrice.toFixed(2)),
      finalPrice: Number.parseFloat(finalPrice.toFixed(2)),
      taxIds: baseItem.applicableTaxes || baseItem.taxIds || [],
      discountIds: baseItem.discountMasterIds || baseItem.discountIds || [],
      taxBreakdown: baseItem.taxBreakdown,
      discountBreakdown: baseItem.discountBreakdown,
      isWarrantyAvailable: baseItem.isWarrantyAvailable,
      warrantyPeriod: baseItem.warrantyPeriod,
      isReturnable: baseItem.isReturnable,
    };
  };

  // Autocomplete search by Item Name
  useEffect(() => {
    const fetchItemName = async () => {
      if (!debouncedItemName.trim()) {
        setItemOptions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const payload = { data: { storeId, itemName: debouncedItemName } };
        const { response, status } = await BackendRequest(
          "/api/inventoryManagement/getItemByNameSkuBarcode",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (status === 200 && Array.isArray(response?.response?.data)) {
          setItemOptions(response.response.data);
          setShowSuggestions(true);
        } else {
          setItemOptions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        setItemOptions([]);
        setShowSuggestions(false);
      }
    };

    fetchItemName();
  }, [debouncedItemName, storeId]);

  // Barcode / SKU Scan listener
  useEffect(() => {
    const fetchByCode = async () => {
      const value = debouncedBarcode || debouncedSkuCode;
      const field = debouncedBarcode ? "barcode" : "skuCode";

      if (!value.trim()) return;

      const payload: any = { data: { storeId } };
      payload.data[field] = value;

      try {
        const { response, status } = await BackendRequest(
          "/api/inventoryManagement/getItemByNameSkuBarcode",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const items = response?.response?.data;
        if (status === 200 && Array.isArray(items) && items.length === 1) {
          const rawItem = items[0];

          setInvoiceItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.id === rawItem.id);
            if (existingIndex !== -1) {
              const updated = [...prev];
              const cur = updated[existingIndex];
              updated[existingIndex] = calculateLineItem(rawItem, cur.quantity + 1);
              return updated;
            } else {
              return [...prev, calculateLineItem(rawItem, 1)];
            }
          });

          setBarcode("");
          setSkuCode("");
          setItemName("");
          setItemOptions([]);
          showToast(`Added: ${rawItem.itemName}`, "success");
        }
      } catch (err) {
        console.error("Barcode lookup failed:", err);
      }
    };

    if (debouncedBarcode || debouncedSkuCode) {
      fetchByCode();
    }
  }, [debouncedBarcode, debouncedSkuCode, storeId]);

  const handleSelectItem = (rawItem: any) => {
    setInvoiceItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === rawItem.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const cur = updated[existingIndex];
        updated[existingIndex] = calculateLineItem(rawItem, cur.quantity + 1);
        return updated;
      } else {
        return [...prev, calculateLineItem(rawItem, 1)];
      }
    });

    setItemName("");
    setItemOptions([]);
    setShowSuggestions(false);
    setTimeout(() => itemNameInputRef.current?.focus(), 50);
  };

  const handleIncrement = (itemId: string) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return calculateLineItem(item, item.quantity + 1);
      })
    );
  };

  const handleDecrement = (itemId: string) => {
    setInvoiceItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;
          if (item.quantity <= 1) return item;
          return calculateLineItem(item, item.quantity - 1);
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleQuantityInput = (itemId: string, newQtyStr: string) => {
    const qty = parseInt(newQtyStr, 10);
    if (isNaN(qty) || qty < 1) return;

    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return calculateLineItem(item, qty);
      })
    );
  };

  const handleDelete = (itemId: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || itemOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < itemOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : itemOptions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < itemOptions.length) {
        handleSelectItem(itemOptions[highlightedIndex]);
      }
    }
  };

  const handleCreateInvoice = async () => {
    if (invoiceItems.length === 0) {
      showToast("Please add at least one item to the invoice.", "warn");
      return;
    }

    const discount = parseFloat(discountOverTotalPrice) || 0;
    const tax = parseFloat(taxOverTotalPrice) || 0;

    const formattedInvoiceItems: InvoiceItemPayload[] = invoiceItems.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
      itemBasePrice: Number.parseFloat(item.baseSellingPrice.toFixed(2)),
      totalBasePrice: Number.parseFloat(item.totalBasePrice.toFixed(2)),
      discountIds: item.discountIds,
      discountPerItem: Number.parseFloat((item.totalDiscountPrice / item.quantity).toFixed(2)),
      totalDiscount: Number.parseFloat(item.totalDiscountPrice.toFixed(2)),
      taxIds: item.taxIds,
      taxPerItem: Number.parseFloat((item.totalTaxPrice / item.quantity).toFixed(2)),
      totalTax: Number.parseFloat(item.totalTaxPrice.toFixed(2)),
      finalPricePerItem: Number.parseFloat((item.finalPrice / item.quantity).toFixed(2)),
      finalPrice: Number.parseFloat(item.finalPrice.toFixed(2)),
    }));

    const result = await createInvoice(
      formattedInvoiceItems,
      customerName,
      customerContactNo,
      discount,
      tax,
      couponCode,
      deliveryStatus,
      paymentStatus,
      Number.parseFloat(grandTotal.toFixed(2))
    );

    if (result) {
      setInvoiceItems([]);
      setCustomerName("");
      setCustomerContactNo("");
      setDiscountOverTotalPrice("0");
      setTaxOverTotalPrice("0");
      setCouponCode("");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            POS Quick Billing
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Scan barcode, search item, and issue verified retail tax invoices with real-time tax breakdown
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (invoiceItems.length > 0) {
                if (confirm("Hold current cart and start a new sale?")) {
                  localStorage.setItem("surge_held_cart", JSON.stringify(invoiceItems));
                  setInvoiceItems([]);
                  showToast("Cart parked on hold!", "warn");
                }
              } else {
                const held = localStorage.getItem("surge_held_cart");
                if (held) {
                  setInvoiceItems(JSON.parse(held));
                  localStorage.removeItem("surge_held_cart");
                  showToast("Resumed parked cart!", "success");
                } else {
                  showToast("No parked cart to resume", "warn");
                }
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            {invoiceItems.length > 0 ? "Park / Hold Cart" : "Resume Parked Cart"}
          </button>
        </div>
      </div>

      {/* Grid: Search & Customer row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Item Scanning & Autocomplete */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-2 border-b border-border/60">
            <ShoppingCart className="w-4 h-4 text-blue-500" />
            <span>Product Scan & Lookup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Barcode scanner input */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-blue-500" />
                <span>Barcode (Scanner)</span>
              </label>
              <input
                type="text"
                ref={barcodeInputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or type barcode..."
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
              />
            </div>

            {/* SKU Code */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>SKU Code</span>
              </label>
              <input
                type="text"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                placeholder="Enter SKU..."
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
              />
            </div>

            {/* Item Name Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span>Item Name Search</span>
              </label>
              <input
                type="text"
                ref={itemNameInputRef}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type item title..."
                autoComplete="off"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
              />

              {showSuggestions && itemOptions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50 py-1 text-sm">
                  {itemOptions.map((item, index) => (
                    <li
                      key={item.id}
                      onMouseDown={() => handleSelectItem(item)}
                      className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                        index === highlightedIndex
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium"
                          : "hover:bg-muted/70 text-foreground"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.itemName}</span>
                        <span className="text-xs text-muted-foreground">
                          SKU: {item.skuCode} | Stock: {item.itemStock ?? "N/A"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">
                          ₹{item.finalPrice?.toFixed(2) ?? "0.00"}
                        </span>
                        {item.totalTaxPrice > 0 && (
                          <span className="block text-[11px] text-emerald-600 dark:text-emerald-400">
                            Incl. Tax ₹{item.totalTaxPrice?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Details */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-2 border-b border-border/60">
            <User className="w-4 h-4 text-emerald-500" />
            <span>Customer Information</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Customer Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer / Hospital"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={customerContactNo}
                  onChange={(e) => setCustomerContactNo(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Billing: Responsive - Cards on Mobile, Table on Desktop */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Mobile View: Cards Layout */}
        <div className="block md:hidden divide-y divide-border">
          {invoiceItems.length > 0 ? (
            invoiceItems.map((item, index) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                        #{index + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">
                        {item.itemName}
                      </h4>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                      <span>SKU: {item.skuCode}</span>
                      {item.barcode && <span>• Barcode: {item.barcode}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-muted/40 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Unit Price</span>
                    <span className="font-mono font-medium text-foreground">₹{item.baseSellingPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tax</span>
                    <span className="font-mono text-foreground">₹{item.totalTaxPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Disc</span>
                    <span className="font-mono text-foreground">₹{item.totalDiscountPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item.id)}
                      className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted active:scale-95 transition-all text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                      className="w-12 text-center py-1 font-semibold text-sm bg-background border border-input rounded-lg outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleIncrement(item.id)}
                      className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted active:scale-95 transition-all text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Line Total</span>
                    <span className="font-mono font-bold text-base text-foreground">
                      ₹{item.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-muted-foreground px-4">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scan barcode or search products to begin
              </p>
            </div>
          )}
        </div>

        {/* Desktop View: Full Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Item Description</th>
                <th className="px-4 py-3.5">Unit Base</th>
                <th className="px-4 py-3.5">Tax (GST)</th>
                <th className="px-4 py-3.5">Discount</th>
                <th className="px-4 py-3.5 text-center">Quantity</th>
                <th className="px-4 py-3.5 text-right">Line Total</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoiceItems.length > 0 ? (
                invoiceItems.map((item, index) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{item.itemName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>SKU: {item.skuCode}</span>
                          {item.barcode && <span>• Barcode: {item.barcode}</span>}
                          {item.isWarrantyAvailable && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              • Warranty: {item.warrantyPeriod}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-foreground">
                        ₹{item.baseSellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-foreground">
                          ₹{item.totalTaxPrice.toFixed(2)}
                        </div>
                        {item.taxBreakdown && item.taxBreakdown.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.taxBreakdown.map((tb, i) => (
                              <span
                                key={i}
                                className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              >
                                {tb.taxCode} ({tb.taxPercentage}%)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">0%</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-foreground">
                        ₹{item.totalDiscountPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDecrement(item.id)}
                            className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                            className="w-12 text-center py-1 font-semibold text-sm bg-background border border-input rounded-lg outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleIncrement(item.id)}
                            className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                        ₹{item.finalPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Scan a barcode or search products above to start billing
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Checkout Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment & Delivery options */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border/60">
            Payment & Fulfillment Details
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
              >
                <option value="Paid">Paid (Cash / UPI / Card)</option>
                <option value="Pending">Pending (Credit / Khata)</option>
                <option value="Partial">Partial Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Delivery Status
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
              >
                <option value="Delivered">Delivered (Handed over in store)</option>
                <option value="Not Delivered">Not Delivered (Pending Pickup)</option>
                <option value="Out for delivery">Out for delivery (Courier/Dispatch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Store Promo Coupon
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMO2026"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors uppercase font-mono"
              />
            </div>
          </div>
        </div>

        {/* Invoice Adjustments */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border/60">
            Overall Adjustments
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Invoice Level Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={discountOverTotalPrice}
                onChange={(e) => setDiscountOverTotalPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Extra Tax / Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={taxOverTotalPrice}
                onChange={(e) => setTaxOverTotalPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Final Grand Total and Action */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground pb-2 border-b border-border/60">
              Billing Summary
            </h3>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal (Base):</span>
              <span className="font-mono text-foreground">₹{subtotalBase.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Dynamic Taxes:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                +₹{totalTaxes.toFixed(2)}
              </span>
            </div>

            {totalDiscounts > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Item Discounts:</span>
                <span className="font-mono text-rose-500">-₹{totalDiscounts.toFixed(2)}</span>
              </div>
            )}

            {parseFloat(discountOverTotalPrice) > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Invoice Discount:</span>
                <span className="font-mono text-rose-500">
                  -₹{parseFloat(discountOverTotalPrice).toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-between items-baseline">
              <span className="text-base font-bold text-foreground">Grand Total:</span>
              <span className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || invoiceItems.length === 0}
            onClick={handleCreateInvoice}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <span>Generating Invoice...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Sale & Issue Invoice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
