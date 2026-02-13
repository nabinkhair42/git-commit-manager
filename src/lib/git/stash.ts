import type { SimpleGit } from "simple-git";
import type { StashEntry, OperationResult } from "./types";

export async function getStashList(git: SimpleGit): Promise<StashEntry[]> {
  try {
    const raw = await git.raw([
      "stash",
      "list",
      "--format=%gd<<SEP>>%H<<SEP>>%s<<SEP>>%aI",
    ]);

    if (!raw.trim()) return [];

    return raw
      .trim()
      .split("\n")
      .map((line) => {
        const [ref, hash, message, date] = line.split("<<SEP>>");
        const indexMatch = ref.match(/stash@\{(\d+)\}/);
        return {
          index: indexMatch ? parseInt(indexMatch[1], 10) : 0,
          hash: hash || "",
          message: message || "",
          date: date || "",
        };
      });
  } catch {
    return [];
  }
}

export async function stashSave(
  git: SimpleGit,
  message?: string,
  includeUntracked: boolean = true
): Promise<OperationResult> {
  try {
    const args = ["stash", "push"];
    if (includeUntracked) args.push("--include-untracked");
    if (message) args.push("-m", message);
    await git.raw(args);
    return { success: true, message: message ? `Stashed: ${message}` : "Changes stashed" };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to stash changes",
    };
  }
}

export async function stashApply(
  git: SimpleGit,
  index: number
): Promise<OperationResult> {
  try {
    await git.raw(["stash", "apply", `stash@{${index}}`]);
    return { success: true, message: `Applied stash@{${index}}` };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to apply stash",
    };
  }
}

export async function stashPop(
  git: SimpleGit,
  index: number
): Promise<OperationResult> {
  try {
    await git.raw(["stash", "pop", `stash@{${index}}`]);
    return { success: true, message: `Popped stash@{${index}}` };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to pop stash",
    };
  }
}

export async function stashDrop(
  git: SimpleGit,
  index: number
): Promise<OperationResult> {
  try {
    await git.raw(["stash", "drop", `stash@{${index}}`]);
    return { success: true, message: `Dropped stash@{${index}}` };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to drop stash",
    };
  }
}

export async function stashClear(git: SimpleGit): Promise<OperationResult> {
  try {
    await git.raw(["stash", "clear"]);
    return { success: true, message: "All stashes cleared" };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to clear stash",
    };
  }
}
