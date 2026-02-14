"use client";

import { useCallback, useState } from "react";
import type { MentionCategory } from "@/lib/mentions/types";
import { MENTION_CATEGORY_SHORTCUTS } from "@/config/constants";

export interface MentionQuery {
  active: boolean;
  raw: string;
  category: MentionCategory | null;
  search: string;
  startPos: number;
  mode: "categories" | "search";
}

const INACTIVE_QUERY: MentionQuery = {
  active: false,
  raw: "",
  category: null,
  search: "",
  startPos: -1,
  mode: "categories",
};

export function parseMentionQuery(text: string, cursorPos: number): MentionQuery {
  // Scan backwards from cursor to find nearest @ preceded by whitespace or at start
  let atPos = -1;
  for (let i = cursorPos - 1; i >= 0; i--) {
    const ch = text[i];
    // If we hit whitespace before finding @, no active mention
    if (/\s/.test(ch)) break;
    if (ch === "@") {
      // Valid if at start of text or preceded by whitespace
      if (i === 0 || /\s/.test(text[i - 1])) {
        atPos = i;
      }
      break;
    }
  }

  if (atPos === -1) return INACTIVE_QUERY;

  const raw = text.slice(atPos + 1, cursorPos);

  // Bare @ — show categories
  if (raw === "") {
    return { active: true, raw, category: null, search: "", startPos: atPos, mode: "categories" };
  }

  // Check for category shortcut prefix (e.g., "file:pack")
  const colonIdx = raw.indexOf(":");
  if (colonIdx !== -1) {
    const prefix = raw.slice(0, colonIdx).toLowerCase();
    const mapped = MENTION_CATEGORY_SHORTCUTS[prefix];
    if (mapped) {
      const search = raw.slice(colonIdx + 1);
      return { active: true, raw, category: mapped, search, startPos: atPos, mode: "search" };
    }
  }

  // No colon or unknown prefix — cross-category search
  return { active: true, raw, category: null, search: raw, startPos: atPos, mode: "search" };
}

export function useMentionQuery() {
  const [query, setQuery] = useState<MentionQuery>(INACTIVE_QUERY);

  const updateQuery = useCallback((text: string, cursorPos: number) => {
    setQuery(parseMentionQuery(text, cursorPos));
  }, []);

  const clearQuery = useCallback(() => {
    setQuery(INACTIVE_QUERY);
  }, []);

  return { query, updateQuery, clearQuery };
}
