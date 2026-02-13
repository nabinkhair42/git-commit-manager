import { z } from "zod/v4";

export const repoPathSchema = z.object({
  path: z.string().min(1, "Repository path is required"),
});

export const resetSchema = z.object({
  hash: z.string().min(1, "Commit hash is required"),
  mode: z.enum(["soft", "mixed", "hard"]),
});

export const branchCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Branch name is required")
    .regex(
      /^[a-zA-Z0-9._\-/]+$/,
      "Branch name can only contain letters, numbers, dots, hyphens, underscores, and slashes"
    ),
  startPoint: z.string().optional(),
});

export const branchDeleteSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  force: z.boolean().optional(),
});

export const commitSearchSchema = z.object({
  search: z.string().optional(),
  author: z.string().optional(),
  branch: z.string().optional(),
});

export type RepoPathInput = z.infer<typeof repoPathSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type BranchDeleteInput = z.infer<typeof branchDeleteSchema>;
export type CommitSearchInput = z.infer<typeof commitSearchSchema>;
