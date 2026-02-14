import { convertToModelMessages, streamText, UIMessage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { createGitTools } from "@/lib/ai/tools";
import { createGitHubTools } from "@/lib/ai/github-tools";
import { buildSystemPrompt, buildGitHubSystemPrompt } from "@/lib/ai/system-prompt";
import { validateRepo, isLocalModeAllowed } from "@/lib/git";
import { getGitHubToken } from "@/lib/auth-helpers";

export const maxDuration = 60;

interface ChatRequestBody {
  messages: UIMessage[];
  mode: "local" | "github";
  repoPath?: string;
  owner?: string;
  repo?: string;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured. Set OPENAI_API_KEY in your environment." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, mode, repoPath, owner, repo }: ChatRequestBody =
      await req.json();

    let tools;
    let systemPrompt: string;

    if (mode === "github") {
      if (!owner || !repo) {
        return new Response(
          JSON.stringify({ error: "Missing owner or repo for GitHub mode" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const token = await getGitHubToken();
      tools = createGitHubTools(owner, repo, token);
      systemPrompt = buildGitHubSystemPrompt(owner, repo);
    } else {
      if (!isLocalModeAllowed()) {
        return new Response(
          JSON.stringify({ error: "Local mode is not available in this environment" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!repoPath) {
        return new Response(
          JSON.stringify({ error: "Missing repoPath" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const isValid = await validateRepo(repoPath);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid git repository path" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      tools = createGitTools(repoPath);
      systemPrompt = buildSystemPrompt(repoPath);
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(8),
      onStepFinish({ toolCalls, finishReason }) {
        if (toolCalls.length > 0) {
          console.log(
            `[Chat] Step finished: ${toolCalls.length} tool call(s), reason: ${finishReason}`
          );
        }
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error) => {
        if (error == null) return "An unknown error occurred.";
        if (typeof error === "string") return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
