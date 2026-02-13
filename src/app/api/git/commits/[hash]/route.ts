import { NextRequest } from "next/server";
import { getGitClient, getCommitDetail } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  const { hash } = await params;

  try {
    const git = getGitClient(path);
    const detail = await getCommitDetail(git, hash);
    return successResponse(detail);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get commit detail");
  }
}
