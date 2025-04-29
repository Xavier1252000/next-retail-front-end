"use client";

import React from "react";
import { useAddClientDetails } from "./useAddClientDetails";

interface ClientDetailsFormProps {
  userId: string;
}

const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({ userId }) => {
  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = useAddClientDetails(userId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Client Details</h2>

      <input
        type="text"
        name="displayName"
        value={formData.displayName}
        onChange={handleChange}
        placeholder="Display Name"
        className="w-full border p-2 rounded"
      />

      <input
        type="email"
        name="secondaryEmail"
        value={formData.secondaryEmail}
        onChange={handleChange}
        placeholder="Secondary Email"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="alternateContactNo"
        value={formData.alternateContactNo}
        onChange={handleChange}
        placeholder="Alternate Contact Number"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="languagePreference"
        value={formData.languagePreference}
        onChange={handleChange}
        placeholder="Language Preference"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="timeZone"
        value={formData.timeZone}
        onChange={handleChange}
        placeholder="Time Zone"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="businessRegistrationNo"
        value={formData.businessRegistrationNo}
        onChange={handleChange}
        placeholder="Business Registration No"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="businessType"
        value={formData.businessType}
        onChange={handleChange}
        placeholder="Business Type"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        placeholder="Country"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="state"
        value={formData.state}
        onChange={handleChange}
        placeholder="State"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="postalCode"
        value={formData.postalCode}
        onChange={handleChange}
        placeholder="Postal Code"
        className="w-full border p-2 rounded"
      />

      <textarea
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Client Details"}
      </button>
    </form>
  );
};

export default ClientDetailsForm;
