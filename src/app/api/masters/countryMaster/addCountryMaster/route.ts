import axios from "axios";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export async function POST(request:Request) {
    const token = (await cookies()).get("authToken")?.value;
    const requestBody = await request.json();

    try {
        const response = await axios.post(`${BACKEND_URL}/master/add-country-master`, requestBody,
            {
                headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return NextResponse.json(response.data, {status: response.status});
    } catch (error) {

        console.log("error in calling confidential/all-users" , error);
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