import { NextRequest } from "next/server";
import { getGitClient, validateRepo } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) return errorResponse("Missing 'path' query parameter", 400);

  try {
    const isRepo = await validateRepo(path);
    if (!isRepo) return errorResponse("Not a git repository", 400);

    const git = getGitClient(path);
    const [branchSummary, remotes, log, status] = await Promise.all([
      git.branchLocal(),
      git.getRemotes(true),
      git.log({ maxCount: 1 }),
      git.status(),
    ]);

    return successResponse({
      path,
      currentBranch: branchSummary.current,
      remotes: remotes.map((r) => ({ name: r.name, refs: r.refs })),
      isClean: status.isClean(),
      headCommit: log.latest?.hash ?? "",
    });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to get repo info");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    if (!path) return errorResponse("Missing 'path' in request body", 400);

    const isRepo = await validateRepo(path);
    return successResponse({ valid: isRepo, path });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Failed to validate repo");
  }
}
