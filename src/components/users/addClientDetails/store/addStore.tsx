"use client";

import React from "react";
import { useAddStore } from "./useAddStore"; // Adjust path if needed
import { useRouter } from "next/navigation";

interface AddStoreFormProps {
  clientId: string;
}

export default function AddStoreForm({ clientId }: AddStoreFormProps) {
  const router = useRouter();

  function cancelForm(){
    router.push("/all-users")
  }

  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    countries,
    setFormData
  } = useAddStore(clientId);

  return (
    <div className="min-h-screen bg-purple-200 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-purple-700 text-center">Add Store</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <label className="block text-purple-700 font-medium mb-1">Client Id</label>
            <input
              name="Client Id"
              value={formData.clientId}
              onChange={handleChange}
              readOnly
              placeholder="SuperMart"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-purple-700 font-medium mb-1">Store Name</label>
            <input
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="SuperMart"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Store Type</label>
            <input
              name="storeType"
              value={formData.storeType}
              onChange={handleChange}
              placeholder="Retail / Online"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="store@example.com"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Contact No</label>
            <input
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="+123456789"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Registration No</label>
            <input
              name="registrationNo"
              value={formData.registrationNo}
              onChange={handleChange}
              placeholder="REG12345"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Tax ID No</label>
            <input
              name="taxIdentificationNo"
              value={formData.taxIdentificationNo}
              onChange={handleChange}
              placeholder="TAX98765"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Currency</label>
            <input
              name="currency"
              value={formData.currency}
              readOnly
              className="w-full px-4 py-2 border bg-purple-100 border-purple-300 rounded-lg text-gray-700"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Timezone</label>
            <input
              name="timezone"
              value={formData.timezone}
              readOnly
              className="w-full px-4 py-2 border bg-purple-100 border-purple-300 rounded-lg text-gray-700"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">City</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">State</label>
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">Postal Code</label>
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="123456"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-purple-700 font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, locality"
            className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        
        <div className="col-span-2">
  <label className="block text-purple-700 font-medium mb-2">Operating Hours</label>
  <div className="space-y-4">
    {formData.operatingHours.map((hour, idx) => (
      <div key={idx} className="grid grid-cols-3 gap-4 items-center">
        <input
          name={`day-${idx}`}
          value={hour.day}
          readOnly
          className="w-full px-2 py-1 border border-purple-300 rounded"
        />
        <input
          type="time"
          value={hour.openingTime}
          onChange={(e) => {
            const newHours = [...formData.operatingHours];
            newHours[idx].openingTime = e.target.value;
            setFormData({ ...formData, operatingHours: newHours });
          }}
          className="px-2 py-1 border border-purple-300 rounded"
        />
        <input
          type="time"
          value={hour.closingTime}
          onChange={(e) => {
            const newHours = [...formData.operatingHours];
            newHours[idx].closingTime = e.target.value;
            setFormData({ ...formData, operatingHours: newHours });
          }}
          className="px-2 py-1 border border-purple-300 rounded"
        />
      </div>
    ))}
  </div>
</div>



        <div className="pt-4 text-center">
        <button
            type="submit"
            onClick={cancelForm}
            className="bg-red-500 mr-100 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition duration-300"
          >
            {isSubmitting ? "Submitting..." : "Create Store"}
          </button>
        </div>
      </form>
    </div>
  );
}
