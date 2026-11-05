'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/context/toast-context';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';
import { useRouter } from 'next/navigation';
import {
  Printer,
  FileText,
  Receipt,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Building2
} from 'lucide-react';

export interface TaxDetail {
  id: string;
  taxCode: string;
  taxType: string;
  taxPercentage: number;
  applicableOn?: string;
  inclusionOnBasePrice?: boolean;
}

export interface InvoiceItem {
  id: string;
  itemName: string;
  itemId: string;
  skuCode?: string | number;
  barcode?: string;
  quantity: number;
  itemBasePrice: number;
  totalBasePrice: number;
  taxPerItem: number;
  discountPerItem: number;
  totalTax: number;
  finalPricePerItem: number;
  finalPrice: number;
  totalDiscount: number;
  discountDetails?: any[];
  taxDetails?: TaxDetail[];
}

export interface Invoice {
  id: string;
  storeName: string;
  storeAddress?: string;
  storeCity?: string;
  storeState?: string;
  storePostalCode?: string;
  storeGstin?: string;
  storeContactNo?: string;
  storeEmail?: string;
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
  createdByName?: string;
  modifiedOn: string;
  modifiedBy: string;
  invoiceTender?: {
    totalAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    paymentModes?: Record<string, number>;
  };
}

export interface InvoiceResponse {
  invoice: Invoice;
  invoiceItems: InvoiceItem[];
}

export default function InvoiceById({ invoiceId }: { invoiceId: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

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

        const result = response?.response;
        if (!result?.error && status === 200) {
          setInvoiceData(result?.data);
        } else {
          showToast(result?.message || 'Failed to fetch invoice', 'error');
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

  const handleNewSale = () => {
    router.push('/billing/addInvoiceItems');
  };

  const handleBackToList = () => {
    router.push('/billing/listInvoice');
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Receipt className="w-8 h-8 animate-pulse text-blue-500" />
        <p className="text-sm font-medium">Loading store invoice #{invoiceId}...</p>
      </div>
    );
  }

  if (!invoiceData || !invoiceData.invoice) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center">
        <Receipt className="w-12 h-12 text-rose-500/40" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Invoice Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Could not find an invoice with ID {invoiceId}.
          </p>
        </div>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const { invoice, invoiceItems } = invoiceData;

  const totalQuantity = invoiceItems.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const totalItemTaxes = invoiceItems.reduce((acc, it) => acc + (it.totalTax || 0), 0);
  const totalItemDiscounts = invoiceItems.reduce((acc, it) => acc + (it.totalDiscount || 0), 0);
  const subtotalBase = invoiceItems.reduce((acc, it) => acc + (it.totalBasePrice || 0), 0);

  const formattedDate = new Date(invoice.createdOn).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(invoice.createdOn).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToList}
            className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            title="Back to Invoices"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>Invoice #{invoice.serialNo}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                invoice.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}>
                {invoice.paymentStatus}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Issued on {formattedDate} at {formattedTime} • By {invoice.createdByName || 'Cashier'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Format Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border text-xs font-medium">
            <button
              type="button"
              onClick={() => setPrintFormat('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                printFormat === 'thermal'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>POS Slip (80mm)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('a4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                printFormat === 'a4'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax Invoice (A4)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            type="button"
            onClick={handleNewSale}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-blue-600/30 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-300 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Bill</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT CONTAINER: Dynamically switches between Thermal 80mm & Standard A4  */}
      {/* ========================================================================= */}
      <div id="print-section" className="w-full flex justify-center">
        {printFormat === 'thermal' ? (
          /* ======================================================= */
          /* 1. THERMAL POS RECEIPT LAYOUT (Exact 80mm dimensions)    */
          /* ======================================================= */
          <div className="w-[80mm] max-w-[80mm] min-w-[80mm] p-4 bg-white text-black font-mono text-xs shadow-2xl rounded-xl border border-neutral-300 dark:border-neutral-700 print:shadow-none print:border-none print:m-0 print:p-0 print-thermal">
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-neutral-400">
              <h2 className="text-base font-extrabold uppercase tracking-tight">
                {invoice.storeName || 'SURGE RETAIL APPARATUS'}
              </h2>
              {invoice.storeAddress && (
                <p className="text-[10px] leading-tight text-neutral-700">
                  {invoice.storeAddress}, {invoice.storeCity} {invoice.storePostalCode}
                </p>
              )}
              {invoice.storeContactNo && (
                <p className="text-[10px] text-neutral-700">Ph: {invoice.storeContactNo}</p>
              )}
              {invoice.storeGstin ? (
                <p className="text-[10px] font-semibold">GSTIN: {invoice.storeGstin}</p>
              ) : (
                <p className="text-[10px] font-semibold">GSTIN: 07AABCS1429B1Z8</p>
              )}
              <p className="text-[9px] text-neutral-600">Surg / Drug Lic: DL-SURG-2026/09</p>
              <div className="inline-block px-2 py-0.5 text-[10px] font-bold border border-black uppercase mt-1">
                Tax Invoice / Cash Memo
              </div>
            </div>

            {/* Bill Info */}
            <div className="py-2.5 text-[10px] space-y-1 border-b border-dashed border-neutral-400">
              <div className="flex justify-between">
                <span>Bill No: #{invoice.serialNo}</span>
                <span>Date: {formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time: {formattedTime}</span>
                <span>Cashier: {invoice.createdByName || 'Staff'}</span>
              </div>
              {invoice.customerName && (
                <div className="pt-1 border-t border-dotted border-neutral-300">
                  <div>Customer: {invoice.customerName}</div>
                  {invoice.customerContactNo && <div>Contact: {invoice.customerContactNo}</div>}
                </div>
              )}
            </div>

            {/* Item Table */}
            <div className="py-2 border-b border-dashed border-neutral-400">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="border-b border-neutral-300 font-bold">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-neutral-200">
                  {invoiceItems.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1 pr-1">
                        <div className="font-semibold leading-tight">{item.itemName}</div>
                        {item.skuCode && (
                          <div className="text-[8px] text-neutral-500">SKU: {item.skuCode}</div>
                        )}
                        {item.totalTax > 0 && (
                          <div className="text-[8px] text-neutral-600">
                            +Tax ₹{item.totalTax.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-1 text-center font-bold">{item.quantity}</td>
                      <td className="py-1 text-right font-mono">
                        ₹{item.itemBasePrice.toFixed(2)}
                      </td>
                      <td className="py-1 text-right font-mono font-bold">
                        ₹{item.finalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Tax Summary */}
            <div className="py-2 text-[10px] space-y-1 border-b border-dashed border-neutral-400 font-mono">
              <div className="flex justify-between">
                <span>Total Items / Qty:</span>
                <span>{invoiceItems.length} / {totalQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal (Base):</span>
                <span>₹{subtotalBase.toFixed(2)}</span>
              </div>
              {totalItemTaxes > 0 && (
                <div className="flex justify-between">
                  <span>Dynamic Taxes (GST):</span>
                  <span>+₹{totalItemTaxes.toFixed(2)}</span>
                </div>
              )}
              {invoice.invoiceTaxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Additional Tax:</span>
                  <span>+₹{invoice.invoiceTaxAmount.toFixed(2)}</span>
                </div>
              )}
              {totalItemDiscounts > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>Item Discounts:</span>
                  <span>-₹{totalItemDiscounts.toFixed(2)}</span>
                </div>
              )}
              {invoice.invoiceDiscountAmount > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>Invoice Discount:</span>
                  <span>-₹{invoice.invoiceDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Big Grand Total */}
              <div className="flex justify-between items-baseline font-bold text-sm pt-2 border-t border-black text-black">
                <span>NET PAYABLE:</span>
                <span className="text-base font-extrabold">₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Tender Info */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-neutral-400 font-mono">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold">{invoice.paymentStatus === 'Paid' ? 'PAID (Cash/UPI)' : invoice.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{invoice.deliveryStatus}</span>
              </div>
            </div>

            {/* Barcode / QR Simulation & Footer */}
            <div className="text-center pt-3 space-y-1.5 text-[9px] text-neutral-600">
              <div className="font-mono tracking-widest text-xs font-bold text-black">
                *INV-{invoice.serialNo}*
              </div>
              <p className="font-semibold text-black">THANK YOU FOR YOUR VISIT!</p>
              <p className="leading-tight text-[8px]">
                Goods once sold can be exchanged within 7 days in original seal with this invoice.
              </p>
              <p className="text-[7px] text-neutral-500">
                Surge Retail POS • Powered by Advanced Agentic Retail
              </p>
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* 2. STANDARD A4 TAX INVOICE LAYOUT                       */
          /* ======================================================= */
          <div className="w-full max-w-4xl p-8 bg-white text-black rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 print:shadow-none print:border-none print:m-0 print:p-0 print-a4">
            {/* Header / Store details */}
            <div className="flex justify-between items-start pb-6 border-b border-neutral-300">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">
                    {invoice.storeName || 'Surge Retail & Surgical Apparatus'}
                  </h2>
                </div>
                <div className="text-xs text-neutral-600 space-y-0.5">
                  <p>{invoice.storeAddress || 'Main Commercial Market, Medical Hub'}, {invoice.storeCity || 'New Delhi'} {invoice.storePostalCode || '110001'}</p>
                  <p>Phone: {invoice.storeContactNo || '+91 98765 43210'} | Email: {invoice.storeEmail || 'sales@surgeretail.com'}</p>
                  <p className="font-semibold text-neutral-800">
                    GSTIN: {invoice.storeGstin || '07AABCS1429B1Z8'} • DL: DL-SURG-2026/09
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded mb-2">
                  Tax Invoice
                </span>
                <p className="text-sm font-bold text-neutral-900">Invoice #{invoice.serialNo}</p>
                <p className="text-xs text-neutral-600">Date: {formattedDate}</p>
                <p className="text-xs text-neutral-600">Time: {formattedTime}</p>
              </div>
            </div>

            {/* Buyer & Bill Meta */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-neutral-300 text-xs">
              <div>
                <h3 className="font-bold text-neutral-800 uppercase tracking-wider mb-1 text-[11px]">
                  Billed To (Customer / Patient)
                </h3>
                <div className="text-neutral-700 space-y-0.5">
                  <p className="font-semibold text-sm text-neutral-900">
                    {invoice.customerName || 'Walk-in Customer'}
                  </p>
                  {invoice.customerContactNo && <p>Contact: {invoice.customerContactNo}</p>}
                  <p>Type: {invoice.generationType || 'Store POS'}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p>
                  <span className="font-semibold text-neutral-700">Payment Status:</span>{' '}
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                    invoice.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.paymentStatus}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-neutral-700">Delivery Status:</span>{' '}
                  <span>{invoice.deliveryStatus}</span>
                </p>
                <p>
                  <span className="font-semibold text-neutral-700">Billed By:</span>{' '}
                  <span>{invoice.createdByName || 'Store Cashier'}</span>
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs border border-neutral-300">
                <thead className="bg-neutral-100 font-semibold text-neutral-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 border-b border-r border-neutral-300 text-center w-10">Sr.</th>
                    <th className="p-2.5 border-b border-r border-neutral-300">Item Description</th>
                    <th className="p-2.5 border-b border-r border-neutral-300 text-center w-16">Qty</th>
                    <th className="p-2.5 border-b border-r border-neutral-300 text-right w-24">Unit Rate</th>
                    <th className="p-2.5 border-b border-r border-neutral-300 text-right w-28">Tax Rate</th>
                    <th className="p-2.5 border-b border-r border-neutral-300 text-right w-24">Tax Amt</th>
                    <th className="p-2.5 border-b border-r border-neutral-300 text-right w-24">Discount</th>
                    <th className="p-2.5 border-b border-neutral-300 text-right w-28">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {invoiceItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="p-2.5 border-r border-neutral-300 text-center text-neutral-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="p-2.5 border-r border-neutral-300">
                        <div className="font-semibold text-neutral-900">{item.itemName}</div>
                        <div className="text-[10px] text-neutral-500 flex gap-2">
                          {item.skuCode && <span>SKU: {item.skuCode}</span>}
                          {item.barcode && <span>Barcode: {item.barcode}</span>}
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-neutral-300 text-center font-bold font-mono">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 border-r border-neutral-300 text-right font-mono">
                        ₹{item.itemBasePrice.toFixed(2)}
                      </td>
                      <td className="p-2.5 border-r border-neutral-300 text-right">
                        {item.taxDetails && item.taxDetails.length > 0 ? (
                          item.taxDetails.map((t, idx) => (
                            <span key={idx} className="block text-[10px] text-neutral-600">
                              {t.taxCode} ({t.taxPercentage}%)
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400">0%</span>
                        )}
                      </td>
                      <td className="p-2.5 border-r border-neutral-300 text-right font-mono">
                        ₹{item.totalTax.toFixed(2)}
                      </td>
                      <td className="p-2.5 border-r border-neutral-300 text-right font-mono text-neutral-600">
                        ₹{item.totalDiscount.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-neutral-900">
                        ₹{item.finalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-50 font-semibold border-t border-neutral-300">
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right font-bold border-r border-neutral-300">
                      Total ({invoiceItems.length} items)
                    </td>
                    <td className="p-2.5 text-center font-bold font-mono border-r border-neutral-300">
                      {totalQuantity}
                    </td>
                    <td className="p-2.5 text-right font-mono border-r border-neutral-300">
                      ₹{subtotalBase.toFixed(2)}
                    </td>
                    <td className="p-2.5 border-r border-neutral-300"></td>
                    <td className="p-2.5 text-right font-mono border-r border-neutral-300">
                      ₹{totalItemTaxes.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right font-mono border-r border-neutral-300">
                      ₹{totalItemDiscounts.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      ₹{(subtotalBase + totalItemTaxes - totalItemDiscounts).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Section: Terms & Summary */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-neutral-300 text-xs">
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-neutral-800 uppercase tracking-wide text-[10px] mb-1">
                    Terms & Conditions
                  </h4>
                  <ul className="list-disc list-inside text-[10px] text-neutral-600 space-y-0.5">
                    <li>Goods once sold can be exchanged within 7 days in original condition.</li>
                    <li>Sterilized & sealed surgical apparatus cannot be returned once opened.</li>
                    <li>Warranty claims subject to manufacturer terms with original invoice.</li>
                  </ul>
                </div>

                <div className="pt-8">
                  <div className="w-48 border-t border-neutral-400 pt-1 text-center">
                    <p className="font-semibold text-[10px] text-neutral-800">Authorized Signatory</p>
                    <p className="text-[9px] text-neutral-500">Surge Retail Store</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2 text-right">
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Gross Subtotal:</span>
                  <span className="font-mono font-semibold">₹{subtotalBase.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-600">Total Tax (GST):</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    +₹{(totalItemTaxes + (invoice.invoiceTaxAmount || 0)).toFixed(2)}
                  </span>
                </div>
                {(totalItemDiscounts > 0 || (invoice.invoiceDiscountAmount || 0) > 0) && (
                  <div className="flex justify-between py-1 border-b border-neutral-200 text-rose-600">
                    <span>Total Discount:</span>
                    <span className="font-mono font-semibold">
                      -₹{(totalItemDiscounts + (invoice.invoiceDiscountAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t-2 border-black text-sm font-extrabold text-neutral-900">
                  <span>Grand Total (INR):</span>
                  <span className="text-lg font-mono">₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
