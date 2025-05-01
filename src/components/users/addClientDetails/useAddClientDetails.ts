"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useRouter } from "next/navigation";

export interface TimeZone {
  id: string;
  name: string;
  offSet: string;
  countryId: string;
}

export interface Country {
  id: string;
  name: string;
  currency: string;
  code: string;
  symbol: string;
  callingCode: string;
  language: string | null;
  timeZones: TimeZone[];
}

export interface ClientFormData {
  userId: string;
  displayName: string;
  secondaryEmail: string;
  alternateContactNo: string;
  languagePreference: string;
  timeZone: string;
  businessRegistrationNo: string;
  businessType: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
}

export const useAddClientDetails = (
  userId: string,
  initialFormData?: ClientFormData,
  initialCountries?: Country[]
) => {
  const [formData, setFormData] = useState<ClientFormData>(
    initialFormData || {
      userId,
      displayName: "",
      secondaryEmail: "",
      alternateContactNo: "",
      languagePreference: "",
      timeZone: "",
      businessRegistrationNo: "",
      businessType: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      address: "",
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>(initialCountries || []);
  const { showToast } = useToast();
  const router = useRouter();

  // Fetch client data only if initialFormData is not provided
  useEffect(() => {
    if (initialFormData) return;

    const fetchClientData = async () => {
      try {
        const { response, status } = await BackendRequest("/api/clientDetails/getClientDetailByUserId", {
          method: "POST",
          body: JSON.stringify({ data: { userId } }),
        });

        if (status === 200 && response?.response?.data) {
          // Normalize fetched data to ensure country is a string
          const fetchedData = response.response.data;
          setFormData({
            ...fetchedData,
            country: fetchedData.country ?? "", // Convert null to empty string
            timeZone: fetchedData.timeZone ?? "", // Also normalize timeZone
            displayName: fetchedData.displayName ?? "",
            secondaryEmail: fetchedData.secondaryEmail ?? "",
            alternateContactNo: fetchedData.alternateContactNo ?? "",
            languagePreference: fetchedData.languagePreference ?? "",
            businessRegistrationNo: fetchedData.businessRegistrationNo ?? "",
            businessType: fetchedData.businessType ?? "",
            state: fetchedData.state ?? "",
            city: fetchedData.city ?? "",
            postalCode: fetchedData.postalCode ?? "",
            address: fetchedData.address ?? "",
          });
        } else {
          showToast("Client not found.");
        }
      } catch (error: any) {
        showToast("Error fetching client data", error.message || error.toString());
      }
    };

    if (userId) fetchClientData();
  }, [userId, showToast, initialFormData]);

  // Fetch countries only if initialCountries is not provided
  useEffect(() => {
    if (initialCountries && initialCountries.length > 0) return;

    const fetchCountries = async () => {
      try {
        const { response, status } = await BackendRequest("/api/masters/countryMaster/getAllCountryMaster", {
          method: "GET",
        });

        if (status === 200 && response?.response?.data) {
          setCountries(response?.response?.data);
        } else {
          showToast("Failed to fetch countries.");
        }
      } catch (error: any) {
        showToast("Error fetching countries", error.message || error.toString());
      }
    };

    fetchCountries();
  }, [showToast, initialCountries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { response, status } = await BackendRequest("/api/clientDetails/updateClientDetails", {
        method: "POST",
        body: JSON.stringify({ data: formData }),
      });

      if (status === 201) {
        showToast(response?.response?.message || "Client details saved successfully!");
        router.push(`/all-users`);
      } else {
        showToast(response?.response?.message || "Failed to save client details.");
      }
    } catch (error: any) {
      showToast("Error saving client details", error.message || error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, handleChange, handleSubmit, isSubmitting, countries, setFormData };
};