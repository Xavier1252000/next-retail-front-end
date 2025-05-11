import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request:Request) {
    const token = (await cookies()).get("authToken")?.value;
    console.log(request)
    const requestBody = await request.json();

    console.log(requestBody)
    try {
        const response = await axios.post(`${BACKEND_URL}/master/add-discount-master`,
            requestBody,
            {
                headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        )
        console.log(response)
        return NextResponse.json(response.data, {status: response.status})
    } catch (error:unknown) {
        console.log("error in calling /master/add-discount-master" , error);
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