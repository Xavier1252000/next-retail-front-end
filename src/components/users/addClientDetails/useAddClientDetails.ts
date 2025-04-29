"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useRouter } from "next/navigation";

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

export interface AddClientResponse extends ClientFormData {
  id: string;
  subscriptionStatus: boolean;
  logoUrl?: string | null;
  currentSubscriptionDetails?: any;
}

export const useAddClientDetails = (userId: string) => {
  const [formData, setFormData] = useState<ClientFormData>({
    userId: userId,
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
  });

  const [addedClient, setAddedClient] = useState<AddClientResponse | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Fetch client details by userId and prefill form
  useEffect(() => {
    const fetchClientDetails = async () => {
        const payload = {
            data:{
                userId: userId
            }
        }
      try {
        const { response, status } = await BackendRequest(`/api/clientDetails/getClientDetailByUserId`,
          { method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
           },
          
        );

        if (status === 200 && response?.response?.data) {
          const clientData = response.response.data;
          setFormData({
            userId: clientData.userId,
            displayName: clientData.displayName || "",
            secondaryEmail: clientData.secondaryEmail || "",
            alternateContactNo: clientData.alternateContactNo || "",
            languagePreference: clientData.languagePreference || "",
            timeZone: clientData.timeZone || "",
            businessRegistrationNo: clientData.businessRegistrationNo || "",
            businessType: clientData.businessType || "",
            country: clientData.country || "",
            state: clientData.state || "",
            city: clientData.city || "",
            postalCode: clientData.postalCode || "",
            address: clientData.address || "",
          });
        }
      } catch (error: any) {
        showToast("Failed to fetch client details", error);
      }
    };

    if (userId) {
      fetchClientDetails();
    }
  }, [userId]);

  const addClientDetails = async (client: ClientFormData = formData) => {
    const payload = {
        data: {
          userId: client.userId,
          displayName: client.displayName,
          secondaryEmail: client.secondaryEmail,
          alternateContactNo: client.alternateContactNo,
          languagePreference: client.languagePreference,
          timeZone: client.timeZone,
          businessRegistrationNo: client.businessRegistrationNo,
          businessType: client.businessType,
          country: client.country,
          state: client.state,
          city: client.city,
          postalCode: client.postalCode,
          address: client.address,
        },
      };

    console.log(payload)

    try {
      setIsSubmitting(true);
      const { response, status } = await BackendRequest("api/clientDetails/updateClientDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 201) {
        const clientData = response?.response?.data;
        setAddedClient(clientData || null);
        showToast(response?.response?.message || "Client details saved successfully!");
        router.push("/all-users/clients");
      } else {
        showToast(response?.response?.message || "Failed to save client details.");
      }
    } catch (error) {
        console.log("------------------------------------",error);
      showToast("Something went wrong while saving client details!");   
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClientDetails(formData);
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isSubmitting,
    addedClient,
  };
};
