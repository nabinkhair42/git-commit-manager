import type { SimpleGit } from "simple-git";
import type { TagInfo, OperationResult } from "./types";

export async function getTags(git: SimpleGit): Promise<TagInfo[]> {
  try {
    // Get all tags with details
    const raw = await git.raw([
      "tag",
      "-l",
      "--sort=-creatordate",
      "--format=%(refname:short)<<SEP>>%(objectname:short)<<SEP>>%(contents:subject)<<SEP>>%(creatordate:iso)<<SEP>>%(taggername)<<SEP>>%(objecttype)",
    ]);

    if (!raw.trim()) return [];

    return raw
      .trim()
      .split("\n")
      .map((line) => {
        const [name, hash, message, date, tagger, objectType] = line.split("<<SEP>>");
        return {
          name: name || "",
          hash: hash || "",
          message: message || "",
          date: date || "",
          tagger: tagger || "",
          isAnnotated: objectType === "tag",
        };
      });
  } catch {
    return [];
  }
}

export async function createTag(
  git: SimpleGit,
  name: string,
  options?: { message?: string; hash?: string }
): Promise<OperationResult> {
  try {
    const args = ["tag"];
    if (options?.message) {
      args.push("-a", name, "-m", options.message);
    } else {
      args.push(name);
    }
    if (options?.hash) {
      args.push(options.hash);
    }
    await git.raw(args);
    return { success: true, message: `Tag '${name}' created` };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to create tag",
    };
  }
}

export async function deleteTag(
  git: SimpleGit,
  name: string
): Promise<OperationResult> {
  try {
    await git.raw(["tag", "-d", name]);
    return { success: true, message: `Tag '${name}' deleted` };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to delete tag",
    };
  }
}
