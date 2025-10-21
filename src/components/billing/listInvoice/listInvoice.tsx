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
  const [selectedInvFilters, setSelectedInvFilters] = useState<String[]>([]);
  const [allInvFilters, setAllInvFilters] = useState<String[]>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [wait, setWaiting] = useState(false);

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
    if (showDropdown === true) { setShowDropdown(false); return }
    const { response, status } = await BackendRequest('/api/billing/getInvoiceFilters/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(response)
    if (status === 200) {
      setAllInvFilters(response?.response?.data);
      setShowDropdown(true);
    }
    setWaiting(false);
  }


  const toggleFilter = (filter: string) => {
    if (selectedInvFilters.includes(filter)) {
      setSelectedInvFilters(selectedInvFilters.filter((f) => f !== filter));
    } else {
      setSelectedInvFilters([...selectedInvFilters, filter]);
    }
  };





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
        <div className="relative">
          <button
            onClick={getInvoiceFilters}
            className="bg-white border border-purple-400 text-purple-500 px-2 py-1 rounded hover:border-purple-700 transition"
          >
            Adapt filters
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-1 left-0 w-48 bg-white border border-gray-300 rounded shadow-lg z-20">
              <ul className="p-2 max-h-48 overflow-auto">
                {!allInvFilters || allInvFilters.length === 0 ? (
                  <li className="text-gray-500 text-center py-2">No filters found</li>
                ) : (
                  allInvFilters.map((filter, idx) => {
                    const filterStr = String(filter);
                    const safeId = `filter-${filterStr.replace(/\s+/g, '-').toLowerCase()}`;
                    return (
                      <li key={safeId || idx} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={safeId}
                          checked={selectedInvFilters.includes(filterStr)}
                          onChange={() => toggleFilter(filterStr)}
                          className="cursor-pointer"
                        />
                        <label htmlFor={safeId} className="cursor-pointer">
                          {filterStr}
                        </label>
                      </li>
                    );
                  })
                )}
              </ul>

              <div className="flex justify-between px-2 pb-2">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600 transition"
                >
                  X
                </button>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="bg-purple-600 text-white px-1 py-0.5 rounded hover:bg-purple-700 transition"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>



        {/* Input fields for selected filters */}
        {selectedInvFilters.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-4">
            {selectedInvFilters.map((filter) => {
              const safeId = `filter-input-${filter.replace(/\s+/g, '-').toLowerCase()}`;
              return (
                <div key={safeId} className="flex flex-col">
                  <label htmlFor={safeId} className="text-sm font-semibold mb-1 capitalize">
                    {filter}
                  </label>
                  <input
                    id={safeId}
                    type="text"
                    placeholder={`Enter ${filter}`}
                    className="border rounded px-2 py-1 w-48"

                  />
                </div>
              );
            })}
          </div>
        )}
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
            <tr className="bg-purple-200 sticky top-13 ">
              {['Sr.', 'Customer', 'Contact', 'Gross', 'Net', 'Tax', 'Discount', 'Total', 'Payment', 'Delivery', 'Created', 'Actions'].map(h => (
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
