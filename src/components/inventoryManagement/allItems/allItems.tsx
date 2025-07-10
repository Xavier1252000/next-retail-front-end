'use client';

import React, { useState, useEffect } from 'react';
import { useAllItems } from './useAllItems';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import editIcon from '../../../icons/editIcon.png';
import detailsIcon from '../../../icons/detailsIcon.png';
import Image from 'next/image';


interface AllItemsProps {
  storeId: string;
}

const AllItems: React.FC = () => {
  const [indexInput, setIndexInput] = useState(1);
  const [itemPerIndexInput, setItemPerIndexInput] = useState(100);
  const [isStaff, setIsStaff] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rolesCookie = Cookies.get("userRoles");
      const storeCookie = Cookies.get("storeId");

      if (rolesCookie) {
        const userRoles = JSON.parse(decodeURIComponent(rolesCookie));

        if (Array.isArray(userRoles) && userRoles.includes("STAFF")) {
          setIsStaff(true);
          if (storeCookie) {
            setStoreId(storeCookie);
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse userRoles cookie:", error);
    }
  }, []);

  const {
    items,
    index,
    totalPages,
    loading,
    setIndex,
    setItemPerIndex,
  } = useAllItems({
    storeId: storeId ?? "", // avoid undefined
  });

  const handleNext = () => {
    if (index + 1 < totalPages) {
      setIndex(index + 1);
      setIndexInput(index + 2); // +2 because index is 0-based
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
      setIndexInput(index);
    }
  };

  const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setIndex(val - 1); // Send 0-based to backend
      setIndexInput(val);
    }
  };

  const handleItemPerIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setItemPerIndex(val);
      setItemPerIndexInput(val);
      setIndex(0); // reset to first page
      setIndexInput(1);
    }
  };

  const addNewItem = () => {
    router.push("/inventoryManagement/addItem");
  }

  const itemDetails = (itemId: string) => {
    router.push(`/inventoryManagement/itemDetails/` + itemId)
  }

  const editItem = (itemId: string) => {
    router.push(`/inventoryManagement/editItem/`+itemId)
  }

  return (
    <div className="relative p-4 rounded-lg bg-white text-purple-900 mt-13">

      <button className="absolute top-6 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        onClick={addNewItem}
      >
        Add New Item
      </button>

      <h2 className="text-2xl font-bold mb-4 text-purple-800">
        Items (Page {index + 1} of {totalPages})
      </h2>

      <div className="mb-4 flex gap-6 items-center">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Page Index</label>
          <input
            type="number"
            min={1}
            value={indexInput}
            onChange={handleIndexChange}
            className="border border-purple-300 rounded px-2 py-1 text-purple-700 w-24"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Items per page</label>
          <input
            type="number"
            min={1}
            value={itemPerIndexInput}
            onChange={handleItemPerIndexChange}
            className="border border-purple-300 rounded px-2 py-1 text-purple-700 w-24"
          />
        </div>
      </div>

      <table className="w-full borde border-gray-300 text-black">
        <thead className="">
          <tr className='bg-purple-200 sticky top-[40px] z-10'>
            <th className="border px-4 py-2">SKU</th>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Threshold</th>
            <th className="border px-4 py-2">Stock Unit</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Final Price (₹)</th>
            <th className="border px-4 py-2">warrenty Avilable</th>
            <th className="border px-4 py-2">Warrenty</th>
            <th className="border px-4 py-2">Returnable</th>
            <th className="border px-4 py-2">Margin</th>
            <th className="border px-4 py-2">Base Price</th>
            <th className="border px-4 py-2">Cost Price</th>
            <th className="border px-4 py-2">Total Tax</th>
            <th className="border px-4 py-2">Total Discount</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map(item => (
              <tr key={item.id} className='hover:bg-purple-100'>
                <td className="border px-4 py-2">{item.skuCode}</td>
                <td className="border px-4 py-2">{item.itemName}</td>
                <td className="border px-4 py-2">{item.stockThreshold}</td>
                <td className="border px-4 py-2">{item.stockUnit}</td>
                <td className={`border px-4 py-2 ${item.itemStock < item.stockThreshold ? 'text-red-500 font-bold':''}`}>{item.itemStock}</td>
                <td className="border px-4 py-2">₹{item.finalPrice}</td>
                <td className="border px-4 py-2">{item.isWarrantyAvailable ? "Yes" : "No"}</td>
                <td className="border px-4 py-2">{item.warrantyPeriod}</td>
                <td className="border px-4 py-2">{item.isReturnable ? "Yes" : "No"}</td>
                <td className="border px-4 py-2">{item.profitMargin}</td>
                <td className="border px-4 py-2">{item.baseSellingPrice}</td>
                <td className="border px-4 py-2">{item.costPrice}</td>
                <td className="border px-4 py-2">{item.totalTaxPrice}</td>
                <td className="border px-4 py-2">{item.totalDiscountPrice}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-2">
                    {/* Edit Icon with Hover Label */}
                    <div className="relative group">
                      <Image src={editIcon} alt="Edit icon" width={25} height={25} 
                      onClick={() => editItem(item.id)}
                      className="hover:scale-120 transition-transform" />
                      <div className="z-10 absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs bg-white px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </div>
                    </div>

                    {/* Details Icon with Hover Label */}
                    <div className="relative group">
                      <Image src={detailsIcon} alt="Details icon" width={25} height={25} 
                      onClick={() => itemDetails(item.id)} 
                      className="hover:scale-120 transition-transform" />
                      <div className="z-10 absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs bg-white px-2 py-0.5 rounded shadow-md opacity-5 group-hover:opacity-500">
                        Details
                      </div>
                    </div>
                  </div>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-4">
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>


      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={index === 0}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          ← Previous
        </button>

        <p className="text-sm text-purple-800">Current Page Index: {index}</p>

        <button
          onClick={handleNext}
          disabled={index + 1 >= totalPages}
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AllItems;
