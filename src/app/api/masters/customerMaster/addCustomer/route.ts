import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("authToken")?.value;
  const requestBody = await request.json();

  try {
    const response = await axios.post(`${BACKEND_URL}/master/add-customer`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("API error in /master/add-customer:", error?.response?.data || error);
    return NextResponse.json(
      error?.response?.data || { error: "Failed to add customer" },
      { status: error?.response?.status || 500 }
    );
  }
}
