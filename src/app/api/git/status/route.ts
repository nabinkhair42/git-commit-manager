import { NextRequest } from "next/server";
import { getGitClient, getStatus } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  try {
    const git = getGitClient(path);
    const status = await getStatus(git);
    return successResponse(status);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get status");
  }
}
