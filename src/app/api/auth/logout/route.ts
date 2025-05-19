import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  // Clear all cookies manually
  const allCookies = (await cookieStore).getAll();
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  allCookies.forEach((cookie) => {
    response.cookies.set({
      name: cookie.name,
      value: "",
      path: "/",
      maxAge: 0,
    });
  });

  return response;
}
