'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import editIcon from '../../../icons/editIcon.png';
import detailsIcon from '../../../icons/detailsIcon.png';
import { BackendRequest } from '@/utils/request-Interceptor/Interceptor';

interface Invoice {
  id: string;
  serialNo: number;
  storeId: string;
  customerName: string;
  customerContactNo: string;
  grossAmount: number;
  netAmount: number;
  invoiceTaxAmount: number;
  invoiceDiscountAmount: number;
  grandTotal: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdOn: string;
  active: boolean;
}

interface FetchInvoiceParams {
  storeId: string;
  skip: number;
  limit: number;
}

// --- Custom Hook ---
const useInvoices = (storeId: string, index: number, limit: number) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      const skip = index * limit;

      try {
        const payload = {
          storeId_in: [storeId],
          grandTotal_gte: 0,
          paymentStatus_in: ['Pending', 'Completed'],
          createdOn_gte: '2025-01-01T00:00:00.000Z',
          skip,
          limit,
        };

        const { response, status } = await BackendRequest('/api/billing/listInvoiceByFilters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });



        if (status === 200) {
          setInvoices(response?.response.data || []);
          //   setTotalCount(response.response. || 0); // Assume backend returns totalCount
        } else {
          setError(response.response.message || 'Something went wrong');
        }
      } catch (err: any) {
        console.error('API error:', err);
        setError('Failed to fetch invoices.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [storeId, index, limit]);

  const totalPages = Math.ceil(totalCount / limit);

  return { invoices, loading, error, totalPages };
};

// --- Main Component ---
const AllInvoices: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [limit, setLimit] = useState(10);
  const [storeId, setStoreId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const rolesCookie = Cookies.get('userRoles');
    const storeCookie = Cookies.get('storeId');

    if (rolesCookie && storeCookie) {
      try {
        const userRoles = JSON.parse(decodeURIComponent(rolesCookie));
        if (userRoles.includes('STAFF')) {
          setStoreId(storeCookie);
        }
      } catch (err) {
        console.error('Failed to parse userRoles cookie', err);
      }
    }
  }, []);

  const { invoices, loading, error, totalPages } = useInvoices(storeId ?? '', index, limit);

  const handlePagination = (dir: 'prev' | 'next') => {
    setIndex(prev => {
      if (dir === 'prev' && prev > 0) return prev - 1;
      if (dir === 'next' && prev + 1 < totalPages) return prev + 1;
      return prev;
    });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setLimit(val);
      setIndex(0); // reset to first page
    }
  };

  const addInvoice = () => router.push('/billing/addInvoice');
  const editInvoice = (id: string) => router.push(`/billing/editInvoice/${id}`);
  const viewDetails = (id: string) => router.push("/billing/invoice/" + id);

  async function getInvoiceFilters(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    const { response, status } = await BackendRequest('/api/billing/getInvoiceFilters/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log(response)
        if(status ===200){
          const invoiceFilters = response?.response?.data;
        }
  }


  return (
    <div className="relative p-4 rounded-lg bg-white text-purple-900 mt-13">
      <button
        onClick={addInvoice}
        className="absolute top-1 right-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
      >
        Add New Invoice
      </button>

      <h2 className="text-2xl font-bold mb-4">Invoices (Page {index + 1} of {totalPages})</h2>

      <div className="mb-4 flex items-center gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Invoices per page</label>
          <input
            type="number"
            min={1}
            value={limit}
            onChange={handleLimitChange}
            className="border rounded px-2 py-1 w-24"
          />
        </div>

        <button
          onClick={getInvoiceFilters}
          className="absolute right-4 bg-white  border border-purple-400 text-purple-500 px-1.5 py-1 rounded hover:border-purple-700 transition"
        >
          Adapt filters
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-6">No invoices found.</div>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-purple-200">
              {['Serial No', 'Customer', 'Contact', 'Gross', 'Net', 'Tax', 'Discount', 'Total', 'Payment', 'Delivery', 'Created', 'Actions'].map(h => (
                <th key={h} className="border px-2 py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-purple-50">
                <td className="border px-2 py-1">{inv.serialNo}</td>
                <td className="border px-2 py-1">{inv.customerName || 'N/A'}</td>
                <td className="border px-2 py-1">{inv.customerContactNo || 'N/A'}</td>
                <td className="border px-2 py-1">₹{inv.grossAmount.toFixed(2)}</td>
                <td className="border px-2 py-1">₹{inv.netAmount.toFixed(2)}</td>
                <td className="border px-2 py-1">₹{inv.invoiceTaxAmount.toFixed(2)}</td>
                <td className="border px-2 py-1">₹{inv.invoiceDiscountAmount.toFixed(2)}</td>
                <td className="border px-2 py-1">₹{inv.grandTotal.toFixed(2)}</td>
                <td className="border px-2 py-1">{inv.paymentStatus}</td>
                <td className="border px-2 py-1">{inv.deliveryStatus}</td>
                <td className="border px-2 py-1">{new Date(inv.createdOn).toLocaleDateString()}</td>
                <td className="border px-2 py-1">
                  <div className="flex gap-2">
                    <Image
                      src={editIcon}
                      alt="Edit"
                      width={20}
                      height={20}
                      onClick={() => editInvoice(inv.id)}
                      className="cursor-pointer"
                    />
                    <Image
                      src={detailsIcon}
                      alt="Details"
                      width={20}
                      height={20}
                      onClick={() => viewDetails(inv.id)}
                      className="cursor-pointer"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => handlePagination('prev')}
          disabled={index === 0}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          ← Previous
        </button>

        <span className="text-sm text-purple-800">Page {index + 1} of {totalPages}</span>

        <button
          onClick={() => handlePagination('next')}
          disabled={index + 1 >= totalPages}
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AllInvoices;
