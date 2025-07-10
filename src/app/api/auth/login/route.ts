import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { serialize } from "cookie";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

console.log("--------------------------------------------------", `${BACKEND_URL}/public/login`)

export async function POST(request: Request) {
    try {
        const requestBody = await request.json();
        const response = await axios.post(
            `${BACKEND_URL}/public/login`,
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        // const token = response.data.response.data.token;
        // const userId = response.data.response.data.user.id;
        // const roles = response.data.response.data.user.roles;
        // const name = response.data.response.data.user?.firstName +" "+ response.data.response.data.user?.lastName;
        // const expirationDate = new Date(response.data.response.data.expirationDate);

        const {
      token,
      expirationDate,
      user: { id: userId, roles, firstName, lastName },
    } = response.data.response.data;

    const expires = new Date(expirationDate);
    const name = `${firstName} ${lastName}`;


        const cookieHeaders = [
      serialize("authToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        expires,
      }),
      serialize("userId", userId.toString(), {
        path: "/",
        expires,
      }),
      serialize("name", name, {
        path: "/",
        expires,
      }),
      serialize("userRoles", JSON.stringify(roles), {
        path: "/",
        expires,
      }),
    ];

    const res = NextResponse.json(response.data, { status: response.status });


        cookieHeaders.forEach((cookie) => {
      res.headers.append("Set-Cookie", cookie);
    });

        // let cookieStore = cookies();
        // (await cookieStore).set("authToken", token, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "lax",
        //     expires: expirationDate,
        //   });
        // (await cookieStore).set("userId", userId, {expires: expirationDate});
        // (await cookieStore).set("name", name, {expires: expirationDate});
        // (await cookieStore).set("userRoles", JSON.stringify(roles), {expires: expirationDate});
        
        return res;
    
    } catch (error: unknown) {
        console.error("API call error:", error);
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
