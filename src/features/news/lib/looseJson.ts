// Tolerant JSON parse for chat-model output: accepts raw JSON, ```json fenced
// blocks, or a JSON object embedded in surrounding prose. Used by
// scripts/wechatToNews.mjs to turn LLM responses into structured locale
// payloads. Throws (never returns undefined) when no JSON object can be
// extracted — including non-string input, so callers get the intended error
// instead of a bare TypeError.
export function parseJsonLoose(text: unknown): unknown {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("no JSON object found in response");
  }
  try {
    return JSON.parse(text);
  } catch {
    /* fall through */
  }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      /* fall through */
    }
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }
  throw new Error("no JSON object found in response");
}
