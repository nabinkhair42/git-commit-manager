import { NextRequest } from "next/server";
import { getGitClient, getBranches, createBranch, deleteBranch } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  try {
    const git = getGitClient(path);
    const branches = await getBranches(git);
    return successResponse({ branches });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get branches");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path, name, startPoint } = await request.json();
    if (!path || !name) return errorResponse("Missing 'path' or 'name'", 400);

    const git = getGitClient(path);
    const result = await createBranch(git, name, startPoint);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to create branch");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { path, name, force } = await request.json();
    if (!path || !name) return errorResponse("Missing 'path' or 'name'", 400);

    const git = getGitClient(path);
    const result = await deleteBranch(git, name, force);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to delete branch");
  }
}
