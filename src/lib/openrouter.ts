import type { OpenRouterModel } from "@/types";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterCompletionOptions {
  apiKey: string;
  model: OpenRouterModel;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface OpenRouterCompletionResult {
  content: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class OpenRouterError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
  }
}

export function getOpenRouterBaseUrl(): string {
  return process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function createChatCompletion(
  options: OpenRouterCompletionOptions
): Promise<OpenRouterCompletionResult> {
  const { apiKey, model, messages, temperature = 0.4, maxTokens = 1200 } = options;

  if (!apiKey.trim()) {
    throw new OpenRouterError("OpenRouter API key is required", 401);
  }

  const response = await fetch(`${getOpenRouterBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        typeof window !== "undefined"
          ? window.location.origin
          : "https://visa-cover-letter-generator.local",
      "X-Title": "Visa Cover Letter Generator",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
    usage?: OpenRouterCompletionResult["usage"];
  };

  if (!response.ok) {
    throw new OpenRouterError(
      payload.error?.message ?? "Failed to generate cover letter",
      response.status
    );
  }

  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new OpenRouterError("No content returned from OpenRouter", 502);
  }

  return {
    content,
    model: payload.model ?? model,
    usage: payload.usage,
  };
}
