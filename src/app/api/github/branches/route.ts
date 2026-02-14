import { NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/auth-helpers";
import { getBranches, deleteBranch } from "@/lib/github/client";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  try {
    const token = await getGitHubToken();
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return errorResponse("owner and repo are required", 400);
    }

    const data = await getBranches(token, owner, repo);
    return successResponse(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch branches";
    return errorResponse(message);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getGitHubToken();
    const body = await request.json();
    const { owner, repo, name } = body;

    if (!owner || !repo || !name) {
      return errorResponse("owner, repo, and name are required", 400);
    }

    const data = await deleteBranch(token, owner, repo, name);
    return successResponse(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete branch";
    return errorResponse(message);
  }
}
