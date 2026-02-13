import { NextRequest } from "next/server";
import { getGitClient, getDiff } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) return errorResponse("Missing 'from' and/or 'to' query parameters", 400);

  try {
    const git = getGitClient(path);
    const result = await getDiff(git, from, to);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get diff");
  }
}
