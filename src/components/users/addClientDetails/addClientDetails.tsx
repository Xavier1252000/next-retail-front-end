"use client";

import React from "react";
import { useAddClientDetails } from "./useAddClientDetails";
import { ClientFormData, Country } from "./useAddClientDetails";

interface ClientDetailsFormProps {
  userId: string;
  initialFormData?: ClientFormData;
  initialCountries?: Country[];
}

const fields = [
  { name: "displayName", placeholder: "Display Name", type: "text" },
  { name: "secondaryEmail", placeholder: "Secondary Email", type: "email" },
  { name: "alternateContactNo", placeholder: "Alternate Contact Number", type: "text" },
  { name: "languagePreference", placeholder: "Language Preference", type: "text" },
  { name: "businessRegistrationNo", placeholder: "Business Registration No", type: "text" },
  { name: "businessType", placeholder: "Business Type", type: "text" },
  { name: "country", placeholder: "Country", type: "select" },
  { name: "state", placeholder: "State", type: "text" },
  { name: "city", placeholder: "City", type: "text" },
  { name: "postalCode", placeholder: "Postal Code", type: "text" },
] as const;

const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({ userId, initialFormData, initialCountries }) => {
  const { formData, handleChange, handleSubmit, isSubmitting, countries, setFormData } = useAddClientDetails(
    userId,
    initialFormData,
    initialCountries
  );

  // Remove duplicate countries by name, keeping the first occurrence
  const uniqueCountries = React.useMemo(() => {
    const seenNames = new Set<string>();
    return countries.filter(country => {
      if (!country.id || !country.name || seenNames.has(country.name)) {
        return false;
      }
      seenNames.add(country.name);
      return true;
    });
  }, [countries]);

  // Update currency and reset time zone when country changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryId = e.target.value;
    const selectedCountry = uniqueCountries.find(country => country.id === selectedCountryId);

    setFormData(prev => ({
      ...prev,
      country: selectedCountryId,
      timeZone: "",
    }));
  };

  // Get the selected country's details for currency and time zones
  const selectedCountry = uniqueCountries.find(country => country.id === formData.country);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Client Details</h2>

      {fields.map(({ name, placeholder, type }) => (
        <div key={name}>
          {name === "country" ? (
            <select
              name={name}
              value={formData.country ?? ""} // Fallback to empty string
              onChange={handleCountryChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Country</option>
              {uniqueCountries.length > 0 ? (
                uniqueCountries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No countries available
                </option>
              )}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={formData[name as keyof ClientFormData] ?? ""} // Type-safe access with fallback
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full border p-2 rounded"
            />
          )}
        </div>
      ))}

      {/* Currency Display */}
      <div className="w-full border p-2 rounded bg-gray-100">
        <span className="text-gray-700">Currency: </span>
        {selectedCountry ? `${selectedCountry.currency} (${selectedCountry.symbol})` : "Select a country"}
      </div>

      {/* Time Zone Dropdown */}
      <select
        name="timeZone"
        value={formData.timeZone ?? ""} // Fallback to empty string
        onChange={handleChange}
        className="w-full border p-2 rounded"
        disabled={!selectedCountry}
      >
        <option value="">Select Time Zone</option>
        {selectedCountry?.timeZones.map(timeZone => (
          <option key={timeZone.id} value={timeZone.id}>
            {timeZone.name} ({timeZone.offSet})
          </option>
        ))}
      </select>

      <textarea
        name="address"
        value={formData.address ?? ""}
        onChange={handleChange}
        placeholder="Address"
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Client Details"}
      </button>
    </form>
  );
};

export default ClientDetailsForm;