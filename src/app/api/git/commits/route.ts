import { NextRequest } from "next/server";
import { getGitClient, getCommits } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  const branch = searchParams.get("branch") || undefined;
  const maxCount = parseInt(searchParams.get("maxCount") || "50", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const search = searchParams.get("search") || undefined;
  const author = searchParams.get("author") || undefined;

  try {
    const git = getGitClient(path);
    const result = await getCommits(git, { branch, maxCount, skip, search, author });
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get commits");
  }
}
