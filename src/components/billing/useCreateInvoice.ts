import { useState } from "react";
import Cookies from "js-cookie";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useToast } from "@/context/toast-context";


export interface InvoiceItemPayload {
  itemId: string;
  quantity: number;
  itemBasePrice: number;
  totalBasePrice: number;
  discountIds: string[];
  discountPerItem: string;
  totalDiscount: string;
  taxIds: string[];
  taxPerItem: string;
  totalTax: string;
  finalPricePerItem: number;
  finalPrice: number;
}

interface CreateInvoicePayload {
  invoiceItems: InvoiceItemPayload[];
  customerName: string;
  customerContactNo: string;
  discountOverTotalPrice: number;
  taxOverTotalPrice: number;
  couponCode: string;
  deliveryStatus: string;
  paymentStatus: string;
  grandTotal: number;
}

export function useCreateInvoice() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const createInvoice = async (
    invoiceItems: InvoiceItemPayload[],
    customerName: string,
    customerContactNo: string,
    discountOverTotalPrice: number,
    taxOverTotalPrice: number,
    couponCode: string,
    deliveryStatus: string,
    paymentStatus: string,
    grandTotal: number
  ) => {
    const storeId = Cookies.get("storeId");

    const payload = {
      data: {
        invoiceItems,
        storeId,
        customerName,
        customerContactNo,
        discountOverTotalPrice,
        taxOverTotalPrice,
        couponCode,
        deliveryStatus,
        paymentStatus,
        grandTotal,
      },
    };

    console.log("------------------------", payload)

    try {
      setLoading(true);
      const { response, status } = await BackendRequest("/api/billing/createInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = response.response;

      if (!result.error && result.status === "Success") {
        showToast("Invoice generated successfully!", "success");
        return result.data; // Return full invoice + invoiceItems
      } else {
        showToast(result.message || "Failed to generate invoice", "error");
        return null;
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      showToast("An error occurred while generating invoice", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createInvoice, loading };
}
