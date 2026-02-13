import { NextRequest } from "next/server";
import { getGitClient, revertCommit } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function POST(request: NextRequest) {
  try {
    const { path, hashes } = await request.json();
    if (!path || !hashes || !Array.isArray(hashes) || hashes.length === 0) {
      return errorResponse("Missing 'path' or 'hashes' (array)", 400);
    }

    const git = getGitClient(path);
    const result = await revertCommit(git, hashes);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Revert failed");
  }
}
