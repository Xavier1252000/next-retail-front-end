import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("authToken")?.value;
  const requestBody = await request.json();

  try {
    const response = await axios.post(`${BACKEND_URL}/items/adjust-stock`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("API error in /items/adjust-stock:", error?.response?.data || error);
    return NextResponse.json(
      error?.response?.data || { error: "Failed to adjust stock" },
      { status: error?.response?.status || 500 }
    );
  }
}
