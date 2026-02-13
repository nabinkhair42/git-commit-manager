import type { SimpleGit } from "simple-git";
import type { ResetMode, OperationResult } from "./types";

export async function resetToCommit(
  git: SimpleGit,
  hash: string,
  mode: ResetMode
): Promise<OperationResult> {
  try {
    await git.reset([`--${mode}`, hash]);
    return {
      success: true,
      message: `Reset (${mode}) to ${hash.slice(0, 7)} successful`,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Reset failed",
    };
  }
}

export async function cherryPickCommit(
  git: SimpleGit,
  hashes: string[]
): Promise<OperationResult> {
  try {
    for (const hash of hashes) {
      await git.raw(["cherry-pick", hash]);
    }
    return {
      success: true,
      message: `Cherry-picked ${hashes.length} commit(s) successfully`,
    };
  } catch (e) {
    // Attempt to abort on failure
    try {
      await git.raw(["cherry-pick", "--abort"]);
    } catch {
      // Ignore abort errors
    }
    return {
      success: false,
      message: e instanceof Error ? e.message : "Cherry-pick failed",
    };
  }
}

export async function revertCommit(
  git: SimpleGit,
  hashes: string[]
): Promise<OperationResult> {
  try {
    for (const hash of hashes) {
      await git.raw(["revert", "--no-edit", hash]);
    }
    return {
      success: true,
      message: `Reverted ${hashes.length} commit(s) successfully`,
    };
  } catch (e) {
    try {
      await git.raw(["revert", "--abort"]);
    } catch {
      // Ignore abort errors
    }
    return {
      success: false,
      message: e instanceof Error ? e.message : "Revert failed",
    };
  }
}
