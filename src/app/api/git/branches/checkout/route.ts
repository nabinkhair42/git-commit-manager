import { NextRequest } from "next/server";
import { getGitClient, checkoutBranch } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function POST(request: NextRequest) {
  try {
    const { path, name } = await request.json();
    if (!path || !name) return errorResponse("Missing 'path' or 'name'", 400);

    const git = getGitClient(path);
    const result = await checkoutBranch(git, name);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Checkout failed");
  }
}
