"use client";
import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';

interface InvoiceItemsType {
    id: string;
    itemName: string;
    quantity: number;
    skuCode: string;
    costPrice: number;
    finalPriceForUnit: number;
    baseSellingPriceForUnit: number;
    totalTaxPriceForUnit: number;
    totalDiscountFourUnit: number;
    baseSellingPrice: number;
    totalTaxPrice: number;
    totalDiscountPrice: number;
    finalPrice: number;
    isWarrantyAvailable: boolean;
    warrantyPeriod: string;
    isReturnable: boolean;
}


interface InvoiceDataType{
    invoiceItems: InvoiceItemsType,
    customerName: string,
    customerContactNo: string,
    discountOverTotalPrice: number,
    taxOverTotalPrice: number,
    couponCode: string,
    deliveryStatus: string,
    paymentStatus: boolean,
    grandTotal: number
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function AddInvoiceItems() {
    const [itemName, setItemName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [skuCode, setSkuCode] = useState('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItemsType[]>([]);
    const [itemOptions, setItemOptions] = useState<InvoiceItemsType[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const itemNameInputRef = useRef<HTMLInputElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const debouncedItemName = useDebounce(itemName, 100);
    const debouncedBarcode = useDebounce(barcode, 300);
    const debouncedSkuCode = useDebounce(skuCode, 700);

    useEffect(() => {
        const fetchItemByName = async () => {
            if (!debouncedItemName.trim()) {
                setItemOptions([]);
                setShowSuggestions(false);
                return;
            }

            const storeId = Cookies.get("storeId");
            const payload = { data: { storeId, itemName: debouncedItemName } };

            try {
                const { response } = await BackendRequest(
                    `/api/inventoryManagement/getItemByNameSkuBarcode`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                const items = response.response.data;
                if (Array.isArray(items)) {
                    setItemOptions(items);
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

        fetchItemByName();
    }, [debouncedItemName]);

    useEffect(() => {
        const fetchByCode = async () => {
            const storeId = Cookies.get("storeId");
            const value = debouncedBarcode || debouncedSkuCode;
            const field = debouncedBarcode ? "barcode" : "skuCode";

            if (!value.trim()) return;

            const payload: any = { data: { storeId } };
            payload.data[field] = value;

            try {
                const { response } = await BackendRequest(
                    `/api/inventoryManagement/getItemByNameSkuBarcode`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

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
                                totalTaxPrice: currentItem.totalTaxPriceForUnit * quantity,
                                totalDiscountPrice: currentItem.totalDiscountFourUnit * quantity,
                                finalPrice: currentItem.finalPriceForUnit * quantity,
                            };

                            return updatedItems;
                        } else {
                            return [
                                ...prev,
                                {
                                    ...newItem,
                                    quantity: 1,
                                    baseSellingPriceForUnit: newItem.baseSellingPrice,
                                    finalPriceForUnit: newItem.finalPrice,
                                    totalDiscountFourUnit: newItem.totalDiscountPrice,
                                    totalTaxPriceForUnit: newItem.totalTaxPrice,
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
    }, [debouncedBarcode, debouncedSkuCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'itemName') setItemName(value);
        if (name === 'barcode') setBarcode(value);
        if (name === 'skuCode') setSkuCode(value);
    };

    const handleSelectItem = (item: InvoiceItemsType) => {
        setInvoiceItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.id === item.id || i.skuCode === item.skuCode);

            if (existingIndex !== -1) {
                const updatedItems = [...prev];
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: updatedItems[existingIndex].quantity + 1,
                };
                return updatedItems;
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });

        setItemName('');
        setItemOptions([]);
        setShowSuggestions(false);
        setTimeout(() => itemNameInputRef.current?.focus(), 0);
    };

    const handleIncrement = (itemId: string) => {
        setInvoiceItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        totalTaxPrice: item.totalTaxPriceForUnit * (item.quantity + 1),
                        totalDiscountPrice: item.totalDiscountFourUnit * (item.quantity + 1),
                        finalPrice: item.finalPriceForUnit * (item.quantity + 1),
                    }
                    : item
            )
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
                            totalTaxPrice: item.totalTaxPriceForUnit * (item.quantity - 1),
                            totalDiscountPrice: item.totalDiscountFourUnit * (item.quantity - 1),
                            finalPrice: item.finalPriceForUnit * (item.quantity - 1),
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };


    const handleKeyDown = (e: { key: any; preventDefault: () => void; }) => {
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

    const createInvoice = () => {

        const invoicePayload = {
            data:{
                invoiceItems: invoiceItems,
                
            }
        }
    };

    return (
        <div className="mt-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-purple-600">Add Invoice Items</h1>
            </div>

            <form className="max-w-8xl mx-auto p-8 shadow-md rounded-2xl space-y-6">
                <div className="flex gap-5">
                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">Barcode</label>
                        <input
                            type="text"
                            name="barcode"
                            value={barcode}
                            onChange={handleChange}
                            autoFocus
                            className="w-full p-2 border border-purple-300 rounded-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">Sku Code</label>
                        <input
                            type="text"
                            name="skuCode"
                            value={skuCode}
                            onChange={handleChange}
                            className="w-full p-2 border border-purple-300 rounded-sm"
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
                            className="w-full p-2 border border-purple-300 rounded-sm"
                        />

                        {showSuggestions && itemOptions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-purple-300 rounded mt-1 max-h-48 overflow-y-auto shadow">
                                {itemOptions.map((item, index) => (
                                    <li
                                        key={item.id}
                                        onMouseDown={() => handleSelectItem(item)}
                                        className={`px-4 py-2 cursor-pointer hover:bg-purple-100 ${index === highlightedIndex ? 'bg-purple-200' : ''
                                            }`}
                                    >
                                        {item.itemName} (SKU: {item.skuCode})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </form>

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
                        <th className="border px-4 py-2">Unit Final Price</th>
                        <th className="border px-4 py-2">Base Price</th>
                        <th className="border px-4 py-2">Tax</th>
                        <th className="border px-4 py-2">Discount</th>
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
                                <td className="border px-4 py-2">₹{item.baseSellingPrice.toFixed(2)}</td>
                                <td className="border px-4 py-2">₹{(item.finalPrice / item.quantity).toFixed(2)}</td>
                                <td className="border px-4 py-2">₹{item.baseSellingPrice}</td>
                                <td className="border px-4 py-2">₹{item.totalTaxPrice.toFixed(2)}</td>
                                <td className="border px-4 py-2">₹{item.totalDiscountPrice.toFixed(2)}</td>
                                <td className="border px-4 py-2">₹{item.finalPrice.toFixed(2)}</td>
                                <td className="border px-4 py-2 flex gap-2 items-center justify-center">
                                    <button onClick={() => handleDecrement(item.id)} className="px-2 bg-gray-200 rounded hover:bg-gray-300">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleIncrement(item.id)} className="px-2 bg-gray-200 rounded hover:bg-gray-300">+</button>
                                    <button onClick={() => handleDelete(item.id)} className="ml-2 text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={13} className="text-center p-4">No items added</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <button
                className="float-right mt-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                onClick={createInvoice}
            >
                Create Invoice
            </button>
        </div>
    );
}

export default AddInvoiceItems;
