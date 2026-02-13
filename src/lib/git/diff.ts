import type { SimpleGit } from "simple-git";
import type { DiffResult } from "./types";

export async function getDiff(
  git: SimpleGit,
  from: string,
  to: string
): Promise<DiffResult> {
  const diff = await git.raw(["diff", from, to]);
  return { diff, from, to };
}
