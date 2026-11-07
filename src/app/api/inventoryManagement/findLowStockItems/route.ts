import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("authToken")?.value;
  try {
    const requestBody = await request.json();
    const response = await axios.post(
      `${BACKEND_URL}/items/find-low-stock-items`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("API call error in /items/find-low-stock-items:", error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error?.response?.data || { error: "Internal server error" },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching low stock items." },
      { status: 500 }
    );
  }
}
