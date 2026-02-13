import { NextRequest } from "next/server";
import { getGitClient, getStashList, stashSave, stashApply, stashPop, stashDrop, stashClear } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  try {
    const git = getGitClient(path);
    const stashes = await getStashList(git);
    return successResponse({ stashes });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get stash list");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, action, message, index, includeUntracked } = body;
    if (!path) return errorResponse("Missing 'path'", 400);

    const git = getGitClient(path);

    switch (action) {
      case "save":
        return successResponse(await stashSave(git, message, includeUntracked));
      case "apply":
        if (index === undefined) return errorResponse("Missing 'index'", 400);
        return successResponse(await stashApply(git, index));
      case "pop":
        if (index === undefined) return errorResponse("Missing 'index'", 400);
        return successResponse(await stashPop(git, index));
      case "drop":
        if (index === undefined) return errorResponse("Missing 'index'", 400);
        return successResponse(await stashDrop(git, index));
      case "clear":
        return successResponse(await stashClear(git));
      default:
        return errorResponse("Invalid action. Use: save, apply, pop, drop, clear", 400);
    }
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Stash operation failed");
  }
}
