import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/all-users", "/addItem", ];
const publicRoutes = ["/", "/login"];

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) =>
        path.startsWith(route)
    );
    const isPublicRoute = publicRoutes.includes(path);
    const token = request.cookies.get("authToken");
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    if (isPublicRoute && token && !path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
