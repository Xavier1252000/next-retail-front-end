import axios from "axios";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export async function POST(request: Request){
    const token = (await cookies()).get("authToken")?.value;
    const requestBody = await request.json();
    console.log(requestBody)

    try {
        const response = await axios.post(`${BACKEND_URL}/items/add-items-to-store`, requestBody,
            {
                headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }

            }
        )

        return NextResponse.json(response.data, {status: response.status});
    } catch (error: unknown) {
        console.log("error in calling item/add-item-to-store" , error);
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