import { NextResponse } from "next/server";
import { ApiResponse } from "@/helper/apiResponse";
import { SESSION_COOKIE_NAME } from "@/lib/jwt";

export async function POST() {
    const apiResponse = new ApiResponse(200, null, "Logged out successfully");
    const response = NextResponse.json(apiResponse, { status: apiResponse.statusCode });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
}
