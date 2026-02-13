"use client";

import {
  createContext,
  useContext,
} from "react";

interface RepoContextValue {
  repoPath: string | null;
}

export const RepoContext = createContext<RepoContextValue>({
  repoPath: null,
});

export function useRepo() {
  return useContext(RepoContext);
}
