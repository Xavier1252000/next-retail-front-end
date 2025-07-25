'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/context/toast-context';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';

interface InvoiceItem {
  id: string;
  itemId: string;
  quantity: number;
  itemBasePrice: number;
  totalBasePrice: number;
  taxPerItem: number;
  totalTax: number;
  finalPricePerItem: number;
  finalPrice: number;
}

interface Invoice {
  id: string;
  serialNo: number;
  storeId: string;
  createdOn: string;
  grandTotal: number;
  grossAmount: number;
  netAmount: number;
  invoiceTaxAmount: number;
  invoiceDiscountAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
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
        console.log(result)
        if (!result.error && status === 200) {
          showToast('Invoice fetched successfully!', 'success');
          setInvoiceData(result.data);
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
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-md print:p-0 print:shadow-none print:bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Invoice #{invoice.serialNo}</h2>
          <p className="text-gray-600">Created on: {new Date(invoice.createdOn).toLocaleString()}</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded print:hidden"
        >
          Print Invoice
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Store ID:</h3>
          <p>{invoice.storeId}</p>
        </div>
        <div>
          <h3 className="font-semibold">Payment Status:</h3>
          <p>{invoice.paymentStatus}</p>
        </div>
        <div>
          <h3 className="font-semibold">Delivery Status:</h3>
          <p>{invoice.deliveryStatus}</p>
        </div>
        <div>
          <h3 className="font-semibold">Invoice ID:</h3>
          <p>{invoice.id}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-purple-100">
              <tr>
                <th className="border px-3 py-2 text-left">Item ID</th>
                <th className="border px-3 py-2 text-right">Quantity</th>
                <th className="border px-3 py-2 text-right">Base Price</th>
                <th className="border px-3 py-2 text-right">Tax</th>
                <th className="border px-3 py-2 text-right">Final Price</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{item.itemId}</td>
                  <td className="border px-3 py-2 text-right">{item.quantity}</td>
                  <td className="border px-3 py-2 text-right">₹{item.itemBasePrice.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">₹{item.taxPerItem.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right font-semibold">₹{item.finalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end text-right">
        <div className="space-y-1 text-sm w-full max-w-sm">
          <div className="flex justify-between">
            <span>Gross Amount:</span>
            <span>₹{invoice.grossAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₹{invoice.invoiceTaxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
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
