import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Country } from "../useAddClientDetails";

export interface OperatingHoursType {
  day: string;
  openingTime: string;
  closingTime: string;
}

export interface StoreFormDataType {
  id?: string;
  clientId: string;
  storeName: string;
  storeType: string;
  currency: string;
  contactNo: string;
  operatingHours: OperatingHoursType[];
  email: string;
  registrationNo: string;
  taxIdentificationId: string;
  taxIdentificationNo: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  staffIds: string[];
  active: boolean;
  timezone?: string;
}

export const useAddStore = (
  clientId: string, // 👈 always use THIS as source of truth
  initialFormData?: StoreFormDataType,
  initialCountries?: Country[]
) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<StoreFormDataType>(
    initialFormData || {
      clientId, // 👈 This will use ONLY the clientId passed as argument
      storeName: "",
      storeType: "",
      currency: "",
      contactNo: "",
      operatingHours: [
        { day: "Monday", openingTime: "", closingTime: "" },
        { day: "Tuesday", openingTime: "", closingTime: "" },
        { day: "Wednesday", openingTime: "", closingTime: "" },
        { day: "Thursday", openingTime: "", closingTime: "" },
        { day: "Friday", openingTime: "", closingTime: "" },
        { day: "Saturday", openingTime: "", closingTime: "" },
        { day: "Sunday", openingTime: "", closingTime: "" },
      ],
      email: "",
      registrationNo: "",
      taxIdentificationId: "",
      taxIdentificationNo: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      staffIds: [],
      active: true,
      timezone: "",
    }
  );

  const [countries, setCountries] = useState<Country[]>(initialCountries || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch countries if not already provided
  useEffect(() => {
    if (initialCountries && initialCountries.length > 0) return;

    const fetchCountries = async () => {
      try {
        const { response, status } = await BackendRequest("/api/masters/countryMaster/getAllCountryMaster", {
          method: "GET",
        });

        if (status === 200 && response?.response?.data) {
          setCountries(response.response.data);
        } else {
          showToast("Failed to fetch countries");
        }
      } catch (error: any) {
        showToast("Error fetching countries", error.message || error.toString());
      }
    };

    fetchCountries();
  }, [initialCountries, showToast]);

  // Auto-update currency and timezone when country changes
  useEffect(() => {
    const selectedCountry = countries.find(c => c.name === formData.country);
    if (selectedCountry) {
      setFormData(prev => ({
        ...prev,
        currency: selectedCountry.currency || "",
        timezone: selectedCountry.timeZones?.[0]?.name || "",
      }));
    }
  }, [formData.country, countries]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log(formData)

    try {
      const { response, status } = await BackendRequest("/api/clientDesk/addStore", {
        method: "POST",
        body: JSON.stringify({ data: formData }),
      });

      if (status === 201) {
        showToast(response?.response?.message || "Store created successfully!");
        router.push("/all-users");
      } else {
        showToast(response?.response?.message || "Failed to create store.");
      }
    } catch (error: any) {
      console.log(error);
      showToast("Error submitting store", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    countries,
    setFormData,
  };
};
