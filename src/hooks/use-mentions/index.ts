"use client";

import { useCallback, useState } from "react";
import type { MentionItem } from "@/lib/mentions/types";

export function useMentions() {
  const [mentions, setMentions] = useState<MentionItem[]>([]);

  const addMention = useCallback((item: MentionItem) => {
    setMentions((prev) => {
      if (prev.some((m) => m.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeMention = useCallback((id: string) => {
    setMentions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMentions = useCallback(() => {
    setMentions([]);
  }, []);

  return { mentions, addMention, removeMention, clearMentions };
}
