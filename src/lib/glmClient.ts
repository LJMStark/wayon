import { getGlmConfig } from "./server-env.ts";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GlmResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
};

export type GlmChatOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

const DEFAULT_TIMEOUT_MS = 60_000;

export async function glmChat({
  messages,
  temperature = 0.2,
  maxTokens = 4096,
}: GlmChatOptions): Promise<string> {
  const { apiKey, baseUrl, model } = getGlmConfig();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `GLM API ${response.status}: ${text.slice(0, 500)}`
      );
    }

    const data = (await response.json()) as GlmResponse;
    if (data.error) {
      throw new Error(`GLM API error: ${data.error.message ?? "unknown"}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error("GLM API returned empty content");
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
}
