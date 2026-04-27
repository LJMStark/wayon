// Tiny markdown-ish → Lexical SerializedEditorState converter.
//
// Input: array of blocks. Each block is:
//   { type: "h2", text: "..." }
//   { type: "h3", text: "..." }
//   { type: "p",  text: "..." }   // bold via **...**, italic via *...*
//   { type: "ul", items: ["...", "..."] }
//   { type: "quote", text: "..." }
//
// Output: { root: { ... children: [...] } } — Payload's default Lexical shape.

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;

function textNode(text, format = 0) {
  return {
    type: "text",
    detail: 0,
    format,
    mode: "normal",
    style: "",
    text,
    version: 1,
  };
}

function linkNode(text, url, format = 0, direction = "ltr") {
  return {
    type: "link",
    format: "",
    indent: 0,
    version: 3,
    fields: {
      url,
      linkType: "custom",
      newTab: false,
    },
    direction,
    children: [textNode(text, format)],
  };
}

// Parse **bold**, *italic*, and [text](url) into Lexical inline nodes.
function parseInline(s, direction = "ltr") {
  const nodes = [];
  let i = 0;
  let buf = "";
  let format = 0;
  const flush = () => {
    if (buf.length > 0) {
      nodes.push(textNode(buf, format));
      buf = "";
    }
  };
  while (i < s.length) {
    // [text](url)
    if (s[i] === "[") {
      const close = s.indexOf("]", i + 1);
      if (close > i && s[close + 1] === "(") {
        const urlEnd = s.indexOf(")", close + 2);
        if (urlEnd > close) {
          flush();
          const text = s.slice(i + 1, close);
          const url = s.slice(close + 2, urlEnd);
          nodes.push(linkNode(text, url, format, direction));
          i = urlEnd + 1;
          continue;
        }
      }
    }
    if (s[i] === "*" && s[i + 1] === "*") {
      flush();
      format = format ^ FORMAT_BOLD;
      i += 2;
      continue;
    }
    if (s[i] === "*") {
      flush();
      format = format ^ FORMAT_ITALIC;
      i += 1;
      continue;
    }
    buf += s[i];
    i += 1;
  }
  flush();
  if (nodes.length === 0) nodes.push(textNode(""));
  return nodes;
}

function paragraph(text, direction = "ltr") {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: "",
    direction,
    children: parseInline(text, direction),
  };
}

function heading(tag, text, direction = "ltr") {
  return {
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction,
    children: parseInline(text, direction),
  };
}

function listItem(text, value, direction = "ltr") {
  return {
    type: "listitem",
    format: "",
    indent: 0,
    version: 1,
    value,
    direction,
    children: parseInline(text, direction),
  };
}

function unorderedList(items, direction = "ltr") {
  return {
    type: "list",
    format: "",
    indent: 0,
    version: 1,
    listType: "bullet",
    start: 1,
    tag: "ul",
    direction,
    children: items.map((t, idx) => listItem(t, idx + 1, direction)),
  };
}

function quote(text, direction = "ltr") {
  return {
    type: "quote",
    format: "",
    indent: 0,
    version: 1,
    direction,
    children: parseInline(text, direction),
  };
}

export function buildLexicalDoc(blocks, { rtl = false } = {}) {
  const direction = rtl ? "rtl" : "ltr";
  const children = blocks.map((b) => {
    if (b.type === "h2") return heading("h2", b.text, direction);
    if (b.type === "h3") return heading("h3", b.text, direction);
    if (b.type === "p") return paragraph(b.text, direction);
    if (b.type === "ul") return unorderedList(b.items, direction);
    if (b.type === "quote") return quote(b.text, direction);
    throw new Error(`Unknown block type: ${b.type}`);
  });
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction,
      children,
    },
  };
}
