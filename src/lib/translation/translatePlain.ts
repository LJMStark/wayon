import type { AppLocale } from "../../i18n/types.ts";

import { glmChat } from "../glmClient.ts";
import { buildSystemPrompt } from "./glossary.ts";

export async function translatePlainText(
  sourceText: string,
  targetLocale: AppLocale
): Promise<string> {
  const trimmed = sourceText.trim();
  if (!trimmed) return "";
  if (targetLocale === "zh") return trimmed;

  const raw = await glmChat({
    messages: [
      { role: "system", content: buildSystemPrompt(targetLocale) },
      { role: "user", content: trimmed },
    ],
    temperature: 0.2,
  });

  return cleanupOutput(raw);
}

// LLMs sometimes wrap output in backticks or quotes despite instructions.
// Strip the most common decorations without touching legitimate content.
function cleanupOutput(value: string): string {
  let out = value.trim();
  if (
    (out.startsWith('"') && out.endsWith('"')) ||
    (out.startsWith("「") && out.endsWith("」"))
  ) {
    out = out.slice(1, -1).trim();
  }
  return out;
}
