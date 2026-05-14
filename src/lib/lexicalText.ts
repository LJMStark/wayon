import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

function extractNodeText(node: SerializedLexicalNode): string {
  if ("text" in node && typeof node.text === "string") return node.text;
  if ("children" in node && Array.isArray(node.children)) {
    return (node.children as SerializedLexicalNode[]).map(extractNodeText).join(" ");
  }
  return "";
}

export function lexicalToPlainText(state: SerializedEditorState, maxLength = 160): string {
  const raw = extractNodeText(state.root as unknown as SerializedLexicalNode)
    .replace(/\s+/g, " ")
    .trim();
  return raw.length > maxLength ? raw.slice(0, maxLength).replace(/\s\S*$/, "…") : raw;
}
