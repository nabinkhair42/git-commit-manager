"use client";

import type { ChatStatus } from "ai";
import type { MentionItem, MentionCategory } from "@/lib/mentions/types";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
import { MentionChips } from "@/components/chat/mention-chips";
import { MentionPicker } from "@/components/chat/mention-picker";
import { useMentions } from "@/hooks/use-mentions";
import { useMentionQuery } from "@/hooks/use-mention-query";
import { MENTION_CATEGORY_SHORTCUTS } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { AtSign, Infinity } from "lucide-react";
import {
  useState,
  useCallback,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" as const },
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    provider: "anthropic" as const,
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic" as const,
  },
  { id: "grok-3", name: "Grok 3", provider: "xai" as const },
];

interface ChatInputProps {
  onSend: (text: string, mentions: MentionItem[]) => void;
  onStop: () => void;
  status: ChatStatus;
  disabled?: boolean;
}

// Reverse map: MentionCategory → shortcut string (e.g., "repository" → "repo")
const CATEGORY_TO_SHORTCUT: Record<string, string> = {};
for (const [shortcut, cat] of Object.entries(MENTION_CATEGORY_SHORTCUTS)) {
  CATEGORY_TO_SHORTCUT[cat] = shortcut;
}

export function ChatInput(props: ChatInputProps) {
  return (
    <PromptInputProvider>
      <ChatInputInner {...props} />
    </PromptInputProvider>
  );
}

function ChatInputInner({
  onSend,
  onStop,
  status,
  disabled,
}: ChatInputProps) {
  const { textInput } = usePromptInputController();
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const { mentions, addMention, removeMention, clearMentions } = useMentions();
  const { query, updateQuery, clearQuery } = useMentionQuery();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  // ── Handlers ──

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      updateQuery(el.value, el.selectionStart ?? el.value.length);
    },
    [updateQuery]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (query.active) {
        if (e.key === "Escape") {
          e.preventDefault();
          clearQuery();
          return;
        }
        // When picker is in search mode, let Enter/Tab select the highlighted item via cmdk
        // We just need to prevent the form submit on Enter
        if (e.key === "Enter" && query.mode === "search") {
          e.preventDefault();
          return;
        }
        // In categories mode, Enter does nothing special (category buttons are clickable)
        if (e.key === "Enter" && query.mode === "categories") {
          e.preventDefault();
          return;
        }
      }
    },
    [query.active, query.mode, clearQuery]
  );

  const handleSelect = useCallback(
    (item: MentionItem) => {
      const text = textInput.value;
      const cursorPos = textareaRef.current?.selectionStart ?? text.length;
      // Remove the @... text from textarea
      const newText = text.slice(0, query.startPos) + text.slice(cursorPos);
      textInput.setInput(newText);
      addMention(item);
      clearQuery();
      // Restore cursor position and focus
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(query.startPos, query.startPos);
        }
      });
    },
    [textInput, query.startPos, addMention, clearQuery]
  );

  const handleSelectCategory = useCallback(
    (category: MentionCategory) => {
      const text = textInput.value;
      const cursorPos = textareaRef.current?.selectionStart ?? text.length;
      const shortcut = CATEGORY_TO_SHORTCUT[category] ?? category;
      // Replace from @ to cursor with @shortcut:
      const insertion = `@${shortcut}:`;
      const newText = text.slice(0, query.startPos) + insertion + text.slice(cursorPos);
      textInput.setInput(newText);
      const newCursorPos = query.startPos + insertion.length;
      // Update query for the new text
      updateQuery(newText, newCursorPos);
      // Set cursor to right after the colon
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    },
    [textInput, query.startPos, updateQuery]
  );

  const handleClose = useCallback(() => {
    clearQuery();
  }, [clearQuery]);

  const handleAtButtonClick = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? textInput.value.length;
    const text = textInput.value;
    // Insert @ at cursor position
    const newText = text.slice(0, pos) + "@" + text.slice(pos);
    textInput.setInput(newText);
    const newPos = pos + 1;
    updateQuery(newText, newPos);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }, [textInput, updateQuery]);

  return (
    <div className="relative shrink-0">
      <MentionPicker
        query={query}
        onSelect={handleSelect}
        onSelectCategory={handleSelectCategory}
        onClose={handleClose}
      />

      <PromptInput
        onSubmit={(message) => {
          if (message.text.trim() || mentions.length > 0) {
            onSend(message.text.trim(), mentions);
            clearMentions();
            clearQuery();
          }
        }}
      >
        <PromptInputHeader>
          <MentionChips mentions={mentions} onRemove={removeMention} />
        </PromptInputHeader>

        <PromptInputTextarea
          ref={textareaRef}
          placeholder="Ask questions about the repo"
          disabled={disabled}
          className="min-h-10"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
        />
        <PromptInputFooter>
          <PromptInputTools>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              type="button"
              onClick={handleAtButtonClick}
              title="Reference repo entities (@)"
            >
              <AtSign className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              type="button"
            >
              <Infinity className="size-3.5" />
              Agent
            </Button>

            <ModelSelector
              open={modelSelectorOpen}
              onOpenChange={setModelSelectorOpen}
            >
              <ModelSelectorTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  type="button"
                >
                  <ModelSelectorLogo provider={currentModel.provider} />
                  {currentModel.name}
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent>
                <ModelSelectorInput placeholder="Search models..." />
                <ModelSelectorList>
                  <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                  <ModelSelectorGroup>
                    {MODELS.map((model) => (
                      <ModelSelectorItem
                        key={model.id}
                        value={model.id}
                        onSelect={() => {
                          setSelectedModel(model.id);
                          setModelSelectorOpen(false);
                        }}
                      >
                        <ModelSelectorLogo provider={model.provider} />
                        <ModelSelectorName>{model.name}</ModelSelectorName>
                      </ModelSelectorItem>
                    ))}
                  </ModelSelectorGroup>
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputTools>

          <PromptInputSubmit
            status={status}
            onStop={onStop}
            disabled={disabled}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
