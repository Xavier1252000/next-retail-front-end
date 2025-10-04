import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Define RouteContext to match auto-generated types
interface RouteContext {
  params: Promise<{ invoiceId: string }>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params; // Resolve the Promise
  const invoiceId = resolvedParams.invoiceId;

  const token = (await cookies()).get("authToken")?.value;

  try {
    const response = await axios.get(`${BACKEND_URL}/billing/get-invoice-by-id/${invoiceId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.log("error in calling /order/get-invoice-by-id", error);
    if (axios.isAxiosError(error)) {
      console.error("API call error:", error.response?.data);
      return NextResponse.json(
        error?.response?.data || { error: "Internal server error" },
        {
          status: error.response?.status || 500,
        }
      );
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}