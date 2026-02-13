import simpleGit, { type SimpleGit } from "simple-git";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const gitInstances = new Map<string, SimpleGit>();

export function getGitClient(repoPath: string): SimpleGit {
  const resolved = resolve(repoPath);

  if (!existsSync(resolved)) {
    throw new Error(`Path does not exist: ${resolved}`);
  }

  const cached = gitInstances.get(resolved);
  if (cached) return cached;

  const git = simpleGit(resolved);
  gitInstances.set(resolved, git);
  return git;
}

export async function validateRepo(repoPath: string): Promise<boolean> {
  try {
    const git = getGitClient(repoPath);
    return await git.checkIsRepo();
  } catch {
    return false;
  }
}
