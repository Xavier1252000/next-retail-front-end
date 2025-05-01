import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: Request) {
    const token = (await cookies()).get("authToken")?.value;
    try {
        const requestBody = await request.json();
        const response = await axios.post(
            `${BACKEND_URL}/permissions/update-user-permission`,
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
        );
        
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: unknown) {
        console.error("API call error: during /permissions/update-user-permission", error);
        if (axios.isAxiosError(error)) {
            console.error("API call error:", error.response?.data);
            return NextResponse.json(
                error?.response?.data || { error: "Internal server error while adding userPermissions /permissions/update-user-permission" },
                {
                    status: error.response?.status || 500,
                }
            );
        } else {
            return NextResponse.json(
                { error: "An unexpected error occurred. in /permissions/update-user-permission" },
                { status: 500 }
            );
        }
    }
}
