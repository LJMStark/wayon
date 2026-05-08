import type { SerializedEditorState } from "lexical";

import type { AppLocale } from "../../i18n/types.ts";

import { translatePlainText } from "./translatePlain.ts";

type LexicalNode = Record<string, unknown> & {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

// Walk a Lexical editor state and translate only `text` leaves. All structural
// metadata (type, format, version, indent, direction, link URLs, etc.) is left
// untouched, so headings stay headings and links stay linked.
export async function translateLexical(
  source: SerializedEditorState,
  targetLocale: AppLocale
): Promise<SerializedEditorState> {
  if (targetLocale === "zh") return source;
  const cloned = structuredClone(source) as SerializedEditorState;
  const root = cloned.root as unknown as LexicalNode | undefined;
  if (!root) return cloned;
  await walkAndTranslate(root, targetLocale);
  return cloned;
}

async function walkAndTranslate(
  node: LexicalNode,
  targetLocale: AppLocale
): Promise<void> {
  if (typeof node.text === "string" && node.text.trim().length > 0) {
    node.text = await translatePlainText(node.text, targetLocale);
  }
  if (Array.isArray(node.children)) {
    // Sequential to keep prompt order deterministic and avoid hammering the
    // GLM endpoint with parallel requests for a single document.
    for (const child of node.children) {
      await walkAndTranslate(child, targetLocale);
    }
  }
}
