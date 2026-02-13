import { NextRequest } from "next/server";
import { getGitClient, resetToCommit } from "@/lib/git";
import type { ResetMode } from "@/lib/git";
import { successResponse, errorResponse } from "@/lib/response/server-response";

export async function POST(request: NextRequest) {
  try {
    const { path, hash, mode } = await request.json();
    if (!path || !hash || !mode) return errorResponse("Missing 'path', 'hash', or 'mode'", 400);

    const validModes: ResetMode[] = ["soft", "mixed", "hard"];
    if (!validModes.includes(mode)) return errorResponse("Invalid reset mode", 400);

    const git = getGitClient(path);
    const result = await resetToCommit(git, hash, mode);
    return successResponse(result);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Reset failed");
  }
}
