"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Select from "react-select";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";

type UpdateTaxMasterProps = {
  taxMasterId: string;
};

const UpdateTaxMaster: React.FC<UpdateTaxMasterProps> = ({ taxMasterId }) => {
  const router = useRouter();
  const { showToast } = useToast();

  type TaxMasterFormData = {
    id?: string;
    storeIds: string[];
    taxType: string;
    taxCode: string;
    taxPercentage: string;
    applicableOn: string;
    inclusionOnBasePrice: boolean;
    applicableCategories: string[];
    description: string;
    active: boolean;
  };

  const [formData, setFormData] = useState<TaxMasterFormData>({
    id: "",
    storeIds: [],
    taxType: "",
    taxCode: "",
    taxPercentage: "",
    applicableOn: "Item",
    inclusionOnBasePrice: false,
    applicableCategories: [],
    description: "",
    active: false,
  });

  const [isStaff, setIsStaff] = useState(false);

  // --- Temporary category list (replace with API call if available)
  const categoryList = [
    { id: 1, name: "category1" },
    { id: 2, name: "category2" },
  ];

  const categoryOptions = categoryList.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  // --- Fetch initial data & detect staff
  useEffect(() => {
    if (!taxMasterId) return;

    const init = async () => {
      try {
        // Detect STAFF role
        const rolesCookie = Cookies.get("userRoles");
        const storeId = Cookies.get("storeId");

        if (rolesCookie && storeId) {
          const userRoles = JSON.parse(decodeURIComponent(rolesCookie));
          if (Array.isArray(userRoles) && userRoles.includes("STAFF")) {
            setIsStaff(true);
            setFormData((prev) => ({ ...prev, storeIds: [storeId] }));
          }
        }

        console.log("Fetching tax master:", taxMasterId);

        // Fetch Tax Master details
        const { response, status } = await BackendRequest(
          "/api/masters/taxMaster/getTaxMasterById",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: { taxMasterId } }),
          }
        );

        const tax = response?.response?.data;
        if (!tax) throw new Error("No tax master data found");

        setFormData({
          id: tax.id,
          taxType: tax.taxType || "",
          taxCode: tax.taxCode || "",
          taxPercentage: tax.taxPercentage?.toString() || "",
          applicableOn: tax.applicableOn || "Item",
          inclusionOnBasePrice: tax.inclusionOnBasePrice ?? false,
          applicableCategories: tax.applicableCategories || [],
          storeIds: tax.storeIds || [],
          description: tax.description || "",
          active: tax.active ?? false,
        });
      } catch (error) {
        console.error("Error initializing tax master:", error);
        showToast("Error loading tax master details", "error");
      }
    };

    init();
  }, [taxMasterId]);

  // --- Handle input changes
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // --- Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        data: {
          ...formData,
          taxPercentage: Number(formData.taxPercentage),
        },
      };

      if(payload.data.applicableOn !== "Category") payload.data.applicableCategories = [];

      const { response, status } = await BackendRequest(
        "/api/masters/taxMaster/updateTaxMaster",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (status === 200 || response?.response?.statusCode === 200) {
        showToast("Tax master updated successfully!", "success");
        router.push("/masters/taxMaster/taxMasterByStoreId");
      } else {
        showToast(response?.response?.message || "Failed to update tax master", "error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("An unexpected error occurred", "error");
    }
  };

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-purple-600">Update Tax Master</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-8 shadow-md rounded-2xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tax Type */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Type</label>
            <input
              type="text"
              name="taxType"
              value={formData.taxType}
              onChange={handleChange}
              required
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tax Code */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Code</label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
              required
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tax Percentage */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Tax Percentage</label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              step="0.01"
              required
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Applicable On */}
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

          {/* Category Select */}
          {formData.applicableOn === "Category" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Select Categories
              </label>
              <Select
                isMulti
                name="applicableCategories"
                options={categoryOptions}
                value={categoryOptions.filter((opt) =>
                  formData.applicableCategories.includes(opt.value)
                )}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    applicableCategories: selected.map((opt) => opt.value),
                  })
                }
                classNamePrefix="react-select"
              />
            </div>
          )}

          {/* Inclusion on Base Price */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 mb-1">
              Inclusion on Base Price
            </label>
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

          {/* Store ID Field (STAFF or ADMIN) */}
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
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Store IDs (comma separated)
              </label>
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
                required
                className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Active Status */}
          <div className="md:col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 border-purple-300 rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition"
        >
          Update Tax Master
        </button>
      </form>
    </div>
  );
};

export default UpdateTaxMaster;
