import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("authToken")?.value;
  const requestBody = await request.json();

  try {
    const response = await axios.post(`${BACKEND_URL}/user/add-client-details`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = typeof response.data === "object" ? response.data : { message: response.data };

    return NextResponse.json(responseData, { status: response.status });
  } catch (error: unknown) {
    console.log("Error in /user/add-client-details", error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const safeErrorData = typeof errorData === "object" ? errorData : { error: String(errorData) };

      return NextResponse.json(safeErrorData, {
        status: error.response?.status || 500,
      });
    }

    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
