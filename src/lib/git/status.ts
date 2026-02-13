import type { SimpleGit } from "simple-git";
import type { StatusInfo } from "./types";

export async function getStatus(git: SimpleGit): Promise<StatusInfo> {
  const status = await git.status();
  return {
    current: status.current,
    tracking: status.tracking,
    ahead: status.ahead,
    behind: status.behind,
    staged: status.staged,
    modified: status.modified,
    deleted: status.deleted,
    untracked: status.not_added,
    conflicted: status.conflicted,
    isClean: status.isClean(),
  };
}
