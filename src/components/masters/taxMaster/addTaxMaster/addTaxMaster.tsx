"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Select from "react-select";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";


function AddTaxMasterForm() {
  const router = useRouter();
  type TaxMasterFormData = {
    storeIds: string[];
    taxType: string;
    taxCode: string;
    taxPercentage: string;
    applicableOn: string;
    inclusionOnBasePrice: boolean;
    applicableCategories: string[];
    description: string;
  };

  const [formData, setFormData] = useState<TaxMasterFormData>({
    storeIds: [],
    taxType: '',
    taxCode: '',
    taxPercentage: '',
    applicableOn: 'Item',
    inclusionOnBasePrice: false,
    applicableCategories: [],
    description: '',
  });

  const { showToast } = useToast();

  const categoryList = [
    { id: 1, name: "category1" }, { id: 2, name: "category2" }
  ]

  const categoryOptions = categoryList.map((cat: any) => ({
    value: cat.id,
    label: cat.name,
  }));


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
          setFormData((prev) => ({ ...prev, storeIds: [storeId] }));
        }
      }
    } catch (error) {
      console.error("Failed to parse userRoles cookie:", error);
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const { response, status } = await BackendRequest("/api/masters/taxMaster/addTaxMaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData })
      });

      if (status === 201 || response?.response?.statusCode === 201) {
        router.push("/masters/taxMaster/taxMasterByStoreId");
        showToast(response?.response.message, "success");
      } else {
        showToast(response?.response?.message || "Failed to add item");
      }
    } catch (err) {
      showToast("something went wrong while adding taxMaster")
    }

  };

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-purple-600">Add Tax Master</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-8  shadow-md rounded-2xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Type</label>
            <input
              type="text"
              name="taxType"
              value={formData.taxType}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Code</label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Percentage</label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Applicable On</label>
            <select
              name="applicableOn"
              value={formData.applicableOn}
              onChange={handleChange}
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Item">Item</option>
              <option value="Category">Category</option>
              <option value="Store">Store</option>
              <option value="Invoice">Invoice</option>
            </select>
          </div>

          {formData.applicableOn === "Category" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Select Categories
              </label>
              <Select
                isMulti
                name="categoryIds"
                options={categoryOptions}
                value={categoryOptions.filter((option) =>
                  formData.applicableCategories?.includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  setFormData({
                    ...formData,
                    applicableCategories: selectedOptions.map((opt) => opt.value),
                  })
                }
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 mb-1">Inclusion on Base Price</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="inclusionOnBasePrice"
                checked={formData.inclusionOnBasePrice}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Include in base price</span>
            </div>
          </div>

          {isStaff ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-purple-700 mb-1">Store ID</label>
              <select
                name="storeIds"
                value={formData.storeIds[0] || ""}
                disabled
                className="w-full p-3 border border-purple-300 rounded-lg bg-gray-100 text-gray-500"
              >
                <option>{formData.storeIds[0]}</option>
              </select>
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-purple-700 mb-1">Store IDs (comma separated)</label>
              <input
                type="text"
                name="storeIds"
                value={formData.storeIds.join(",")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storeIds: e.target.value.split(",").map((id) => id.trim()),
                  })
                }
                className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
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
          Add Tax Master
        </button>
      </form>
    </div>
  );
}

export default AddTaxMasterForm;

