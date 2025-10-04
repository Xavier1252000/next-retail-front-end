'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/toast-context';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';

interface InvoiceItem {
  id: string;
  itemName: string;
  itemId: string;
  quantity: number;
  itemBasePrice: number;
  totalBasePrice: number;
  taxPerItem: number;
  discountPerItem: number;
  totalTax: number;
  finalPricePerItem: number;
  finalPrice: number;
  totalDiscount: number;
  discountDetails: object[];
  taxDetails: object[];
}

interface Invoice {
  id: string;
  storeName: string;
  serialNo: number;
  storeId: string;
  grandTotal: number;
  grossAmount: number;
  netAmount: number;
  invoiceTaxAmount: number;
  invoiceDiscountAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  customerName: string;
  customerContactNo: string;
  generationType: string;
  createdOn: string;
  createdBy: string;
  createdByName: String;
  modifiedOn: string;
  modifiedBy: string;
}

interface InvoiceResponse {
  invoice: Invoice;
  invoiceItems: InvoiceItem[];
}

function InvoiceById({ invoiceId }: { invoiceId: string }) {
  const { showToast } = useToast();
  const [invoiceData, setInvoiceData] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const { response, status } = await BackendRequest(
          `/api/billing/getInvoiceById/${invoiceId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const result = response.response;
        if (!result.error && status === 200) {
          showToast('Invoice fetched successfully!', 'success');
          setInvoiceData(result?.data);
        } else {
          showToast(result.message || 'Failed to fetch invoice', 'error');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        showToast('An error occurred while fetching invoice', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, showToast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!invoiceData) return <div className="p-4 text-center">No invoice data</div>;

  const { invoice, invoiceItems } = invoiceData;

  return (
    <div id="print-section" className="p-6 max-w-4xl mt-13 mx-auto bg-white shadow-md rounded-md print:p-0 print:shadow-none print:bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{invoice.storeName}</h2>
          <h2 className="text-l font-bold">Invoice #{invoice.serialNo}</h2>
          <p className="text-gray-600">Billing on: {new Date(invoice.createdOn).toLocaleString()}, Billing by: {invoice.createdByName}</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded print:hidden"
        >
          Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <p className="text-base">
          <span className="font-semibold">Payment Status:</span>{' '}
          <span className="font-normal">{invoice.paymentStatus}</span>
        </p>
        <p className="text-base">
          <span className="font-semibold">Delivery Status:</span>{' '}
          <span className="font-normal">{invoice.deliveryStatus}</span>
        </p>
        <p className="text-base">
          <span className="font-semibold">Customer Name:</span>{' '}
          <span className="font-normal">{invoice.customerName}</span>
        </p>
        <p className="text-base">
          <span className="font-semibold">Customer Contact No:</span>{' '}
          <span className="font-normal">{invoice.customerContactNo}</span>
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-purple-100">
              <tr>
                <th className="border px-3 py-2 text-left">Items</th>
                <th className="border px-3 py-2 text-right">Quantity</th>
                <th className="border px-3 py-2 text-right">Base Price</th>
                <th className="border px-3 py-2 text-right">Tax/Item</th>
                <th className="border px-3 py-2 text-right">Total Tax</th>
                <th className="border px-3 py-2 text-right">Discount/Item</th>
                <th className="border px-3 py-2 text-right">Total Discount</th>
                <th className="border px-3 py-2 text-right">Final price/item</th>
                <th className="border px-3 py-2 text-right">Final Price</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{item.itemName ? item.itemName : "Total"}</td>
                  <td className="border px-3 py-2 text-right">{item.quantity}</td>
                  <td className="border px-3 py-2 text-right">₹{item?.itemBasePrice != null ? item.itemBasePrice.toFixed(2) : "0.00"}</td>
                  <td className="border px-3 py-2 text-right">₹{item.taxPerItem != null ? item.taxPerItem.toFixed(2) : "0.00"}</td>
                  <td className="border px-3 py-2 text-right">₹{item.totalTax? item.totalTax : item.taxPerItem?(item.taxPerItem*item.quantity).toFixed(2):null}</td>
                  <td className="border px-3 py-2 text-right">₹{item.discountPerItem != null ? item.discountPerItem.toFixed(2) : "0.00"}</td>
                  <td className="border px-3 py-2 text-right">₹{item.totalDiscount != null ? item.totalDiscount.toFixed(2) : "0.00"}</td>
                  <td className="border px-3 py-2 text-right">₹{item.finalPricePerItem != null ? item.finalPricePerItem.toFixed(2) : (item.finalPrice / item.quantity).toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right font-semibold">₹{item.finalPrice != null ? item.finalPrice.toFixed(2) : "0.00"}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="border px-3 py-2">Total</td>
                <td className="border px-3 py-2 text-right">
                  {invoiceItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </td>
                <td className="border px-3 py-2 text-right">
                  ₹{invoiceItems.reduce((sum, item) => sum + (item.itemBasePrice || 0), 0).toFixed(2)}
                </td>
                <td className="border px-3 py-2 text-right">
                  ₹{invoiceItems.reduce((sum, item) => sum + (item.taxPerItem || 0), 0).toFixed(2)}
                </td>
                <td className="border px-3 py-2 text-right">
                  ₹{invoiceItems.reduce((sum, item) => sum + (item.totalTax || 0), 0).toFixed(2)}
                </td>
                <td className="border px-3 py-2 text-right">
                  ₹{invoiceItems.reduce((sum, item) => sum + (item.discountPerItem || 0), 0).toFixed(2)}
                </td>
                <td className="border px-3 py-2 text-right">
                  ₹{invoiceItems.reduce((sum, item) => sum + (item.totalDiscount || 0), 0).toFixed(2)}
                </td>
                <td className="border px-3 py-2 text-right">
                  
                </td>
                <td className="border px-3 py-2 text-right font-bold">
                  ₹{invoiceItems.reduce((sum, item) => sum + (item.finalPrice || 0), 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end text-right">
        <div className="space-y-1 text-sm w-full max-w-sm">
          <div className="flex justify-between">
            <span>Net Amount:</span>
            <span>₹{invoice.netAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Additional Tax:</span>
            <span>₹{invoice.invoiceTaxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Additional Discount:</span>
            <span>₹{invoice.invoiceDiscountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Grand Total:</span>
            <span>₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceById;
