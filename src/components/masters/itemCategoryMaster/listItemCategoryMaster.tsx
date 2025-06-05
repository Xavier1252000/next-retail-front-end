"use client";

import { useToast } from "@/context/toast-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";

interface ItemCategoryData{
    id:string,
    storeIds: string[],
    categoryName: string,
    parentCategoryId: string,
    description: string
}

const AllItemCategoryMasters: React.FC = () =>{
    const [categories, setCategories] = useState<ItemCategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const {showToast} = useToast();
    const router = useRouter();

  const userRoles = Cookies.get("userRoles");
  let roles: string[] = [];
  try {
    roles = JSON.parse(userRoles || "[]");
  } catch (err) {
    console.error("Error parsing userRoles:", err);
  }

  let payload = {}
  if (roles.includes("STAFF")) {
    const storeId = Cookies.get("storeId");
    payload = {
      data: {
        storeIds: [storeId]
      }
    };
  } else {
    payload = {
      data: {
        storeIds: []
      }
    }
  }


  const fetchItemCategories = async () => {
      setIsLoading(true);
      try {
        const { response, status } = await BackendRequest('/api/masters/itemCategoryMaster/getAllItemCategoryMaster', {
          method: 'POST',
          headers: {
          },
          body: JSON.stringify(payload)
        });
        console.log(response.response)
        if (status === 200 && response?.response?.statusCode === 200) {
          setCategories(response?.response?.data || []);
        } else {
          showToast('Failed to fetch units');
        }
      } catch (error) {
        showToast('Something went wrong while fetching units');
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
        fetchItemCategories();
      }, []);

    const addCategoryMaster = () => {
        router.push("/")
    }

    return (
    <div className="mt-10 overflow-x-auto bg-white shadow-md rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-purple-600">Category Masters</h1>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          onClick={addCategoryMaster}
        >
          Add New Category Master
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No category master records found.</div>
      ) : (
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-purple-500 text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Category Name</th>
              <th className="px-4 py-2">Parent Category ID</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-300">
            {categories.map((category, index) => (
              <tr key={category.id} className="hover:bg-purple-100 transition">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{category.categoryName}</td>
                <td className="px-4 py-2">{category.parentCategoryId || "-"}</td>
                <td className="px-4 py-2">{category.description || "-"}</td>
                <td className="px-4 py-2">
                  <button
                    className="bg-purple-500 hover:bg-purple-700 text-white px-2 py-1 rounded-lg text-sm font-medium mx-1"
                    onClick={() => router.push(`/masters/categoryMaster/updateCategoryMaster/${category.id}`)}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-sm font-medium"
                    onClick={() => showToast("Delete logic not implemented yet")}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllItemCategoryMasters;