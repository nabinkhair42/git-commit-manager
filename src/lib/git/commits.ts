import type { SimpleGit } from "simple-git";
import type { CommitInfo, CommitDetail, FileChange } from "./types";

const LOG_FORMAT = {
  hash: "%H",
  abbreviatedHash: "%h",
  message: "%s",
  body: "%b",
  authorName: "%an",
  authorEmail: "%ae",
  date: "%aI",
  refs: "%D",
  parentHashes: "%P",
};

export async function getCommits(
  git: SimpleGit,
  options: {
    branch?: string;
    maxCount?: number;
    skip?: number;
    search?: string;
    author?: string;
  } = {}
): Promise<{ commits: CommitInfo[]; total: number }> {
  const { branch, maxCount = 50, skip = 0, search, author } = options;

  const args = ["log", `--format=${JSON.stringify(LOG_FORMAT)}`.replace(/"/g, "")];

  // Build a proper format string
  const formatParts = [
    `%H`,   // hash
    `%h`,   // abbreviated hash
    `%s`,   // subject
    `%b`,   // body
    `%an`,  // author name
    `%ae`,  // author email
    `%aI`,  // date
    `%D`,   // refs
    `%P`,   // parent hashes
  ];
  const separator = "<<SEP>>";
  const recordSep = "<<REC>>";
  const format = formatParts.join(separator) + recordSep;

  const logArgs: string[] = [`--format=${format}`, `--max-count=${maxCount}`, `--skip=${skip}`];

  if (search) {
    logArgs.push(`--grep=${search}`, "-i");
  }
  if (author) {
    logArgs.push(`--author=${author}`);
  }
  if (branch) {
    logArgs.push(branch);
  }

  const raw = await git.raw(["log", ...logArgs]);

  const records = raw.split(recordSep).filter((r) => r.trim());
  const commits: CommitInfo[] = records.map((record) => {
    const parts = record.split(separator);
    return {
      hash: parts[0]?.trim() ?? "",
      abbreviatedHash: parts[1]?.trim() ?? "",
      message: parts[2]?.trim() ?? "",
      body: parts[3]?.trim() ?? "",
      authorName: parts[4]?.trim() ?? "",
      authorEmail: parts[5]?.trim() ?? "",
      date: parts[6]?.trim() ?? "",
      refs: parts[7]?.trim() ?? "",
      parentHashes: (parts[8]?.trim() ?? "").split(" ").filter(Boolean),
    };
  });

  // Get total count
  const countArgs: string[] = ["rev-list", "--count"];
  if (search) countArgs.push(`--grep=${search}`, "-i");
  if (author) countArgs.push(`--author=${author}`);
  countArgs.push(branch || "HEAD");

  let total = commits.length + skip;
  try {
    const countRaw = await git.raw(countArgs);
    total = parseInt(countRaw.trim(), 10) || total;
  } catch {
    // fallback to estimated count
  }

  return { commits, total };
}

export async function getCommitDetail(
  git: SimpleGit,
  hash: string
): Promise<CommitDetail> {
  const separator = "<<SEP>>";
  const formatParts = ["%H", "%h", "%s", "%b", "%an", "%ae", "%aI", "%D", "%P"];
  const format = formatParts.join(separator);

  const raw = await git.raw(["show", `--format=${format}`, "--stat", hash]);

  const firstLine = raw.split("\n")[0] ?? "";
  const parts = firstLine.split(separator);

  const info: CommitInfo = {
    hash: parts[0]?.trim() ?? "",
    abbreviatedHash: parts[1]?.trim() ?? "",
    message: parts[2]?.trim() ?? "",
    body: parts[3]?.trim() ?? "",
    authorName: parts[4]?.trim() ?? "",
    authorEmail: parts[5]?.trim() ?? "",
    date: parts[6]?.trim() ?? "",
    refs: parts[7]?.trim() ?? "",
    parentHashes: (parts[8]?.trim() ?? "").split(" ").filter(Boolean),
  };

  // Get diff
  const diff = await git.raw(["diff", `${hash}~1..${hash}`, "--"]).catch(() =>
    git.raw(["show", hash, "--format=", "--"])
  );

  // Get file stats
  const statRaw = await git.raw([
    "diff",
    "--numstat",
    `${hash}~1..${hash}`,
    "--",
  ]).catch(() => git.raw(["show", "--numstat", "--format=", hash]));

  const nameStatusRaw = await git.raw([
    "diff",
    "--name-status",
    `${hash}~1..${hash}`,
    "--",
  ]).catch(() => git.raw(["show", "--name-status", "--format=", hash]));

  const statusMap = new Map<string, string>();
  for (const line of nameStatusRaw.split("\n").filter(Boolean)) {
    const [status, ...fileParts] = line.split("\t");
    const file = fileParts.join("\t");
    if (status && file) statusMap.set(file, status);
  }

  let totalInsertions = 0;
  let totalDeletions = 0;
  const files: FileChange[] = [];

  for (const line of statRaw.split("\n").filter(Boolean)) {
    const [ins, del, file] = line.split("\t");
    if (!file) continue;
    const insertions = ins === "-" ? 0 : parseInt(ins ?? "0", 10);
    const deletions = del === "-" ? 0 : parseInt(del ?? "0", 10);
    const binary = ins === "-" && del === "-";
    totalInsertions += insertions;
    totalDeletions += deletions;

    const rawStatus = statusMap.get(file) ?? "M";
    files.push({
      file,
      changes: insertions + deletions,
      insertions,
      deletions,
      binary,
      status: rawStatus.charAt(0) as FileChange["status"],
    });
  }

  return {
    ...info,
    diff,
    stats: {
      changed: files.length,
      insertions: totalInsertions,
      deletions: totalDeletions,
    },
    files,
  };
}
