import { NextRequest } from "next/server";
import { getGitClient, mergeBranch } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function POST(request: NextRequest) {
  try {
    const { path, source } = await request.json();
    if (!path || !source) return errorResponse("Missing 'path' or 'source'", 400);

    const git = getGitClient(path);
    const result = await mergeBranch(git, source);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Merge failed");
  }
}
