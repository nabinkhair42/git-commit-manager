import { NextRequest } from "next/server";
import { getGitClient, getTags, createTag, deleteTag } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  try {
    const git = getGitClient(path);
    const tags = await getTags(git);
    return successResponse({ tags });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get tags");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path, name, message, hash } = await request.json();
    if (!path || !name) return errorResponse("Missing 'path' or 'name'", 400);

    const git = getGitClient(path);
    const result = await createTag(git, name, { message, hash });
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to create tag");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { path, name } = await request.json();
    if (!path || !name) return errorResponse("Missing 'path' or 'name'", 400);

    const git = getGitClient(path);
    const result = await deleteTag(git, name);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to delete tag");
  }
}
