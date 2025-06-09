"use client";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";



interface ItemCategoryFormData{
    categoryName: string,
    storeIds: string[],
    description: string
}
const AddItemCategoryMaster : React.FC = () => {

     const [itemCategoryFormData, setItemCategoryFormData] = useState<ItemCategoryFormData>({
        categoryName: "",
        storeIds: [],
        description: ""
    })
    const {showToast} = useToast();
    const router = useRouter();
    const [isStaff, setIsStaff] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return; // Ensure it's only run on client
    
        try {
          const rolesCookie = Cookies.get('userRoles');
          const storeId = Cookies.get('storeId');
    
          if (rolesCookie && storeId) {
            const userRoles = JSON.parse(decodeURIComponent(rolesCookie));
    
            if (Array.isArray(userRoles) && userRoles.includes('STAFF')) {
              setIsStaff(true);
              setItemCategoryFormData((prev) => ({ ...prev, storeIds: [storeId] }));
            }
          }
        } catch (error) {
          console.error("Failed to parse userRoles cookie:", error);
        }
      }, []);

   

    const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value, type,  } = e.target;

  setItemCategoryFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
          console.log(itemCategoryFormData)
          const { response, status } = await BackendRequest("/api/masters/itemCategoryMaster/addItemCategoryMaster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: itemCategoryFormData })
          });
    
          if (status === 201 || response?.response?.statusCode === 201) {
            router.push("/masters/itemCategoryMaster/allItemCategoryMasters");
            showToast(response?.response.message);
          } else {
            showToast(response?.response?.message || "Failed to add item");
          }
        } catch (err) {
          console.log(err)
          showToast("something went wrong while adding taxMaster")
        }
    
      };

    return (
  <div className="mt-12 px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-purple-600">Add Item Category</h1>
    </div>

    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-2xl space-y-6"
    >
      <div className="space-y-6">

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Category Name</label>
          <input
            type="text"
            name="categoryName"
            value={itemCategoryFormData.categoryName}
            onChange={handleChange}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {!isStaff && (
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Store IDs (comma separated)</label>
            <input
              type="text"
              name="storeIds"
              value={itemCategoryFormData.storeIds.join(",")}
              onChange={(e) =>
                setItemCategoryFormData({
                  ...itemCategoryFormData,
                  storeIds: e.target.value.split(",").map((id) => id.trim()),
                })
              }
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">Description</label>
          <textarea
            name="description"
            value={itemCategoryFormData.description}
            onChange={handleChange}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          ></textarea>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition"
      >
        Add Category
      </button>
    </form>
  </div>
);
};
export default AddItemCategoryMaster;