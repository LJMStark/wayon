#!/usr/bin/env node
// Fetch a WeChat MP article, rewrite it into a 4-locale News draft, and seed
// it into the Payload `news` collection (status=draft).
//
// Pipeline:
//   1. Fetch the article HTML, parse title + ordered list of paragraphs and images.
//   2. Hard-fail if the article contains zero images (cover is required).
//   3. Download each image (with WeChat Referer) and upload to Payload media (R2).
//      The first image becomes the cover; all images stay inline in body order.
//   4. Call Gemini (default: gemini-3.1-flash-lite) to rewrite zh and translate
//      to en/es/ar. Output is structured JSON: title, excerpt, paragraphs[].
//   5. Build Lexical doc per locale, interleaving image upload nodes back into
//      the original paragraph positions.
//   6. Create News doc with _status: "draft" so it sits in admin for review.
//
// Usage:
//   node --env-file=.env.local scripts/wechatToNews.mjs \
//     --url https://mp.weixin.qq.com/s/XXXX                # dry-run
//   node --env-file=.env.local scripts/wechatToNews.mjs \
//     --url https://mp.weixin.qq.com/s/XXXX --apply        # writes to DB
//
// Optional flags:
//   --slug my-custom-slug         (default: derived from rewritten zh title)
//   --category industry           (default: industry; allowed: company/industry/exhibition/product)
//   --model gemini-3.1-flash-lite (default; any Gemini model id from
//                                  https://generativelanguage.googleapis.com/v1beta/models)
//   --provider gemini|openai      (default: inferred from --model; anything containing
//                                  "gemini" → gemini, everything else → openai/OpenAI-wire).
//                                  OpenAI-wire endpoints read WECHAT_OPENAI_API_KEY and
//                                  WECHAT_OPENAI_BASE_URL (default: OpenRouter,
//                                  e.g. --model minimax/minimax-m3).

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { pinyin } from "pinyin-pro";
import { getPayload } from "payload";

import { buildLexicalDoc } from "./seoArticles/lexical.mjs";
import { parseJsonLoose } from "../src/features/news/lib/looseJson.ts";

const ALLOWED_CATEGORIES = ["company", "industry", "exhibition", "product"];
const ALLOWED_LOCALES = ["zh", "en", "es", "ar"];
const RTL_LOCALES = new Set(["ar"]);

const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// OpenAI-wire-compatible provider. Default gateway is OpenRouter; the default
// model is only used when --provider openai is selected without an explicit
// --model. Base URL is read from WECHAT_OPENAI_BASE_URL. The script appends
// `/v1/chat/completions`.
const OPENAI_DEFAULT_MODEL = "minimax/minimax-m3";
const OPENAI_DEFAULT_BASE_URL = "https://openrouter.ai/api";
// Generous completion budget so long articles don't get their JSON body
// truncated mid-response.
const OPENAI_MAX_TOKENS = 16_000;
const ALLOWED_PROVIDERS = ["gemini", "openai"];

// Images smaller than this are almost always WeChat decorations (separator
// lines, 1px placeholders, emoji-sized graphics). Drop them entirely — they
// don't belong in the news body and can't be a cover.
const MIN_IMAGE_BYTES = 5_000;

// Animated formats are excluded from both cover and body — they read as
// noise/memes in a corporate news context.
const FORBIDDEN_IMAGE_MIMES = new Set(["image/gif"]);

function parseArgs(argv) {
  const args = { apply: false, skipImages: new Set() };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") args.apply = true;
    else if (a === "--url") args.url = argv[++i];
    else if (a === "--slug") args.slug = argv[++i];
    else if (a === "--category") args.category = argv[++i];
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--provider") args.provider = argv[++i];
    else if (a === "--debug-dir") args.debugDir = argv[++i];
    else if (a === "--skip-images") {
      const raw = argv[++i] || "";
      for (const tok of raw.split(",")) {
        const n = parseInt(tok.trim(), 10);
        if (Number.isFinite(n) && n > 0) args.skipImages.add(n);
      }
    }
  }
  if (!args.url) {
    console.error("ERROR: --url is required");
    console.error("Usage: node --env-file=.env.local scripts/wechatToNews.mjs --url <wechat-url> [--apply]");
    console.error("       Optional: --skip-images \"2,11\"  (1-based indices from a prior dry-run)");
    console.error("       Optional: --model gemini-3.1-pro-preview  (default: gemini-3.1-flash-lite)");
    process.exit(2);
  }
  args.category ||= "industry";
  // Resolve provider + model. Priority: explicit --provider, else infer from the
  // --model id (gpt-*/o1/o3/o4/chatgpt-* → openai), else gemini. Then fill the
  // per-provider default model only when --model wasn't given.
  if (!args.provider) {
    args.provider = inferProvider(args.model);
  }
  args.provider = args.provider.toLowerCase();
  if (!ALLOWED_PROVIDERS.includes(args.provider)) {
    console.error(`ERROR: --provider must be one of: ${ALLOWED_PROVIDERS.join(", ")}`);
    process.exit(2);
  }
  if (!args.model) {
    args.model = args.provider === "openai" ? OPENAI_DEFAULT_MODEL : DEFAULT_MODEL;
  }
  if (!ALLOWED_CATEGORIES.includes(args.category)) {
    console.error(`ERROR: --category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
    process.exit(2);
  }
  return args;
}

// --- 1. Fetch + parse WeChat article ---------------------------------------

async function fetchArticleHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch WeChat article: HTTP ${res.status}`);
  }
  const html = await res.text();
  if (html.includes("环境异常") || html.includes("请完成验证")) {
    throw new Error(
      "WeChat returned a verification page (the article URL may have expired or the link is rate-limited). " +
        "Open the URL in a browser first, then retry.",
    );
  }
  return html;
}

// Walk the WeChat #js_content tree top-to-bottom and emit an ordered list of
// "raw blocks":
//   { type: "h2"|"h3"|"p", text }
//   { type: "img", src }
//   { type: "ul", items: [string] }
// Inline formatting is dropped — the LLM rewrite stage produces fresh prose.
function extractRawBlocks($, html) {
  const $content = $("#js_content");
  if ($content.length === 0) {
    // Fallback: WeChat "share_content_page" / image-message format.
    // The article has no #js_content DOM; the title is in <meta og:title>,
    // the body text lives in <meta og:description>, and the images sit in a
    // cgiDataNew JSON blob as `cdn_url: '...'` entries.
    const shareBlocks = extractShareContentBlocks($, html);
    if (shareBlocks) return shareBlocks;
    throw new Error(
      "Could not find #js_content in the WeChat HTML — the page layout may have changed, or this is not a standard MP article URL.",
    );
  }

  const out = [];

  function pushText(type, text) {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length > 0) out.push({ type, text: cleaned });
  }

  function visit(node) {
    if (node.type === "text") {
      // Loose text nodes outside any block element — buffer as paragraph.
      pushText("p", node.data || "");
      return;
    }
    if (node.type !== "tag") return;
    const $el = $(node);
    const tag = node.name.toLowerCase();

    if (tag === "img") {
      // WeChat uses data-src for lazy-loaded images. Fall back to src.
      const src = $el.attr("data-src") || $el.attr("src");
      if (src && /^https?:\/\//.test(src)) {
        out.push({ type: "img", src });
      }
      return;
    }
    if (tag === "h1" || tag === "h2") {
      pushText("h2", $el.text());
      return;
    }
    if (tag === "h3" || tag === "h4" || tag === "h5") {
      pushText("h3", $el.text());
      return;
    }
    if (tag === "p") {
      const innerImgs = $el.find("img").toArray();
      if (innerImgs.length === 0) {
        pushText("p", $el.text());
      } else {
        // Paragraph with an image inside — emit text-before, image, text-after.
        // Simple approach: emit text of the paragraph (minus img) plus images
        // in source order.
        $el.contents().each((_, c) => visit(c));
      }
      return;
    }
    if (tag === "ul" || tag === "ol") {
      const items = $el
        .children("li")
        .toArray()
        .map((li) => $(li).text().replace(/\s+/g, " ").trim())
        .filter(Boolean);
      if (items.length > 0) out.push({ type: "ul", items });
      return;
    }
    if (tag === "blockquote") {
      pushText("p", $el.text());
      return;
    }
    if (tag === "section" || tag === "div" || tag === "span" || tag === "article") {
      // Container — descend. But if it has no element children and just text,
      // treat as paragraph (WeChat editor wraps lots of bare text in divs).
      const hasBlockChildren = $el
        .children()
        .toArray()
        .some((c) => /^(p|h\d|ul|ol|section|div|img|blockquote)$/i.test(c.name || ""));
      if (!hasBlockChildren) {
        pushText("p", $el.text());
      } else {
        $el.contents().each((_, c) => visit(c));
      }
      return;
    }
    // Unknown tag — recurse into children.
    $el.contents().each((_, c) => visit(c));
  }

  $content.contents().each((_, c) => visit(c));
  return out;
}

// Fallback parser for WeChat "share_content_page" / image-message format.
// These posts have no #js_content DOM; instead the body text is stuffed into
// <meta og:description> and the images live as `cdn_url: '...'` entries inside
// a cgiDataNew JSON blob. Returns the same `{ type, text|src|items }[]` shape
// as extractRawBlocks so the rest of the pipeline doesn't care which format
// the source was in. Returns null if the HTML doesn't look like a share page.
function extractShareContentBlocks($, html) {
  if ($("#js_article.share_content_page").length === 0) return null;

  const desc =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    "";
  if (!desc.trim()) return null;

  // 1) Build the image list.
  //    - cover URL comes from <meta og:image>.
  //    - body images come from `cdn_url: '...'` entries that include the
  //      `from=appmsg` marker — that flag identifies images explicitly cited
  //      by the article (matching the in-message numbering P1, P2, ...). All
  //      other cdn_url entries are thumbnails / low-res duplicates / popup
  //      share assets, which would otherwise blow up the image list with
  //      near-duplicates that the user can't visually tell apart.
  //    cdnUrls[0] is reserved for the cover; cdnUrls[1..] are P1, P2, ...
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const cdnRegex = /cdn_url\s*:\s*'(https?:\/\/[^']+from=appmsg[^']*)'/g;
  const cdnUrls = [];
  const seen = new Set();
  if (ogImage) {
    cdnUrls.push(ogImage);
    seen.add(ogImage);
  }
  let m;
  while ((m = cdnRegex.exec(html)) !== null) {
    const raw = m[1].replace(/\\x26amp;/g, "&").replace(/\\x26/g, "&");
    if (seen.has(raw)) continue;
    seen.add(raw);
    cdnUrls.push(raw);
  }
  if (cdnUrls.length === 0) return null;

  // 2) Decode the description. WeChat stuffs literal JS-style escapes into the
  //    meta content (`\x0a` for newline, `\x26lt;` for `&lt;`, etc.) — these
  //    aren't HTML entities, so cheerio leaves them as literal text. Decode
  //    `\xNN` first (→ raw char), then HTML entities. Order matters: `\x26`
  //    must become `&` before we try to resolve `&lt;` → `<`.
  const decoded = desc
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 3) Walk paragraphs. Each `\n\n`-separated block becomes one or more blocks.
  //    Lines starting with `🔹` get split into an h3 + a p. `——XXX——` lines
  //    become h3. Hashtag-only paragraphs are dropped. The `data-seq="N"`
  //    markers inside `<a class="wx_img_refer_link">` tell us which image
  //    indices to insert after that paragraph (N corresponds to cdnUrls[N],
  //    since cdnUrls[0] is the cover image and P1...PN are body images).
  const out = [];
  const usedImg = new Set();

  function emitImagesForSeqs(seqNums) {
    for (const n of seqNums) {
      if (n < cdnUrls.length && !usedImg.has(n)) {
        out.push({ type: "img", src: cdnUrls[n] });
        usedImg.add(n);
      }
    }
  }

  function pushClean(type, text) {
    const cleaned = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (cleaned.length > 0) out.push({ type, text: cleaned });
  }

  // Cover always goes first (matches existing #js_content behaviour: the first
  // image block becomes the News.coverImage and also appears at the top of the
  // body).
  out.push({ type: "img", src: cdnUrls[0] });
  usedImg.add(0);

  const paragraphs = decoded.split(/\n\s*\n/);
  for (const rawPara of paragraphs) {
    // Two patterns to collect image indices:
    //   range:  <a ...data-seq="1"...>P1</a>-<a ...data-seq="3"...>P3</a>
    //           → expand to [1, 2, 3]
    //   single: <a ...data-seq="N"...>PN</a>  → [N]
    // Ranges take precedence so the implicit middle indices aren't lost.
    const rangeRegex =
      /data-seq=["']?(\d+)["']?[^<]*<\/a>\s*[-–—]\s*<a[^>]*data-seq=["']?(\d+)["']?/g;
    const seqNums = [];
    const seenInPara = new Set();
    const consumed = new Set();
    let rm;
    while ((rm = rangeRegex.exec(rawPara)) !== null) {
      const lo = parseInt(rm[1], 10);
      const hi = parseInt(rm[2], 10);
      const [a, b] = lo <= hi ? [lo, hi] : [hi, lo];
      for (let k = a; k <= b; k++) {
        if (!seenInPara.has(k)) {
          seenInPara.add(k);
          seqNums.push(k);
        }
      }
      consumed.add(lo);
      consumed.add(hi);
    }
    for (const sm of rawPara.matchAll(/data-seq=["']?(\d+)["']?/g)) {
      const n = parseInt(sm[1], 10);
      if (consumed.has(n)) continue;
      if (!seenInPara.has(n)) {
        seenInPara.add(n);
        seqNums.push(n);
      }
    }
    seqNums.sort((a, b) => a - b);

    // Split by single newlines — each line is its own potential block.
    const lines = rawPara
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let emittedTextInPara = false;
    for (const line of lines) {
      const plain = line.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (!plain) continue;

      // Hashtag-only line (after stripping tags): `#xxx #yyy ...`
      if (/^(#\S+\s*)+$/.test(plain)) continue;

      // Image-reference-only line: `【P1-P3】` or `P1` standalone after tag strip.
      if (/^[【\[]?\s*P\d+(\s*[-–]\s*P\d+)?\s*[】\]]?$/.test(plain)) continue;

      // Decorated section header: `—— PRODUCT·产品信息 ——`
      if (/^[—–-]{2,}.+[—–-]{2,}$/.test(plain)) {
        pushClean("h3", plain);
        emittedTextInPara = true;
        continue;
      }

      // Product header: `🔹 SM1232MJ09002 新古驰红`
      if (/^🔹/.test(plain)) {
        pushClean("h3", plain.replace(/^🔹\s*/, ""));
        emittedTextInPara = true;
        continue;
      }

      pushClean("p", plain);
      emittedTextInPara = true;
    }

    // Attach images referenced by data-seq markers to the end of the paragraph,
    // but only if the paragraph actually emitted text (avoid orphaned images).
    if (emittedTextInPara) emitImagesForSeqs(seqNums);
  }

  // 4) Append any leftover images (not referenced by data-seq) at the end so
  //    nothing is lost.
  for (let i = 1; i < cdnUrls.length; i++) {
    if (!usedImg.has(i)) out.push({ type: "img", src: cdnUrls[i] });
  }

  return out;
}

function extractTitle($) {
  const fromMeta = $('meta[property="og:title"]').attr("content");
  if (fromMeta) return fromMeta.trim();
  const fromActivity = $("#activity-name").text().trim();
  if (fromActivity) return fromActivity;
  const fromTitle = $("title").text().trim();
  return fromTitle || "Untitled";
}

function parseArticle(html) {
  const $ = cheerio.load(html);
  const title = extractTitle($);
  const blocks = extractRawBlocks($, html);
  const imageCount = blocks.filter((b) => b.type === "img").length;
  return { title, blocks, imageCount };
}

// --- 2. Download images + upload to Payload media --------------------------

const IMAGE_MIME = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function inferExtFromMime(mime) {
  if (mime?.includes("jpeg")) return "jpg";
  if (mime?.includes("png")) return "png";
  if (mime?.includes("gif")) return "gif";
  if (mime?.includes("webp")) return "webp";
  return null;
}

function inferExtFromUrl(url) {
  // WeChat URLs sometimes encode format in path: ?wx_fmt=jpeg
  const fmtMatch = url.match(/wx_fmt=(jpeg|jpg|png|gif|webp)/i);
  if (fmtMatch) return fmtMatch[1].toLowerCase() === "jpeg" ? "jpg" : fmtMatch[1].toLowerCase();
  const extMatch = url.match(/\.(jpe?g|png|gif|webp)(?:\?|$)/i);
  if (extMatch) return extMatch[1].toLowerCase() === "jpeg" ? "jpg" : extMatch[1].toLowerCase();
  return null;
}

// SSRF 围栏：文章 HTML 是不可信输入，img src 可以指向内网/任意主机，而下载的
// 字节会被发布到公开 R2。只允许微信系 CDN 域名；fetch 默认跟随重定向，所以
// 最终落点也要复检。命中围栏的图片按"下载失败"处理（调用方逐图 try/catch 跳过）。
const IMAGE_HOST_ALLOWLIST = /(^|\.)(qpic\.cn|qlogo\.cn|wx\.qq\.com|weixin\.qq\.com)$/i;
const IMAGE_MAX_BYTES = 15 * 1024 * 1024; // 微信正文图远小于 15MB
const IMAGE_FETCH_TIMEOUT_MS = 30_000;

function assertAllowedImageHost(rawUrl, phase) {
  const { protocol, hostname } = new URL(rawUrl);
  if (protocol !== "https:" && protocol !== "http:") {
    throw new Error(`blocked non-http(s) image URL (${phase}): ${rawUrl}`);
  }
  if (!IMAGE_HOST_ALLOWLIST.test(hostname)) {
    throw new Error(`blocked non-WeChat image host "${hostname}" (SSRF guard, ${phase}): ${rawUrl}`);
  }
}

async function downloadImage(url) {
  assertAllowedImageHost(url, "request");
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://mp.weixin.qq.com/",
    },
    signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
  });
  if (res.url) assertAllowedImageHost(res.url, "redirect target");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const mimeFromHeader = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  // 拦下明显非图片的响应（HTML/JSON 等）；octet-stream/缺头交给扩展名推断兜底。
  if (mimeFromHeader && !mimeFromHeader.startsWith("image/") && mimeFromHeader !== "application/octet-stream") {
    throw new Error(`blocked non-image content-type "${mimeFromHeader}": ${url}`);
  }
  const declaredLen = Number(res.headers.get("content-length") || 0);
  if (declaredLen > IMAGE_MAX_BYTES) {
    throw new Error(`image exceeds ${IMAGE_MAX_BYTES} bytes (content-length=${declaredLen}): ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > IMAGE_MAX_BYTES) {
    throw new Error(`image exceeds ${IMAGE_MAX_BYTES} bytes (actual=${buf.length}): ${url}`);
  }
  const ext = inferExtFromMime(mimeFromHeader) || inferExtFromUrl(url) || "jpg";
  const mime = IMAGE_MIME[ext] || "image/jpeg";
  return { buf, ext, mime };
}

async function uploadImageToPayload(payload, { buf, ext, mime }, { slug, index, altText }) {
  const filename = `news-${slug}-${String(index + 1).padStart(2, "0")}.${ext}`;
  const created = await payload.create({
    collection: "media",
    data: {
      alt: altText,
      category: "other",
    },
    file: {
      data: buf,
      mimetype: mime,
      name: filename,
      size: buf.length,
    },
  });
  return { id: created.id, filename, url: created.url };
}

// --- 3. LLM rewriting (Gemini or OpenAI-compatible) ------------------------

// Infer the provider from a model id. Only models that actually name Gemini
// go to the Gemini (Google AI Studio) branch; everything else — including
// OpenRouter-style "org/model:tag" ids like "z-ai/glm-5.2:free" — goes through
// the OpenAI-wire branch, since OpenRouter is the default OpenAI-wire gateway.
function inferProvider(model) {
  if (!model) return "openai";
  if (/gemini/i.test(String(model))) return "gemini";
  return "openai";
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    const hint =
      name === "GEMINI_API_KEY"
        ? "Get a key at https://aistudio.google.com/apikey"
        : name === "WECHAT_OPENAI_API_KEY"
          ? "Set the API key for your OpenAI-compatible endpoint (provider=openai)."
          : "";
    throw new Error(`Missing ${name}. Add it to .env.local. ${hint}`);
  }
  return v;
}

// Dispatch to the selected provider. Both providers return either parsed JSON
// (expectJson) or raw text, so the callers don't care which backend ran.
async function callLLM({ provider, model, system, user, expectJson = true }) {
  if (provider === "openai") {
    return callOpenAI({ model, system, user, expectJson });
  }
  return callGemini({ model, system, user, expectJson });
}

async function callOpenAI({ model, system, user, expectJson = true }) {
  const apiKey = requireEnv("WECHAT_OPENAI_API_KEY");
  const base = (process.env.WECHAT_OPENAI_BASE_URL || OPENAI_DEFAULT_BASE_URL).replace(/\/+$/, "");
  const url = `${base}/v1/chat/completions`;
  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: OPENAI_MAX_TOKENS,
  };
  // Request strict JSON mode when we expect a JSON payload. (The prompts already
  // contain the word "JSON", which OpenAI's json_object mode requires.)
  if (expectJson) body.response_format = { type: "json_object" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const choice = data?.choices?.[0];
  if (!choice) {
    throw new Error(`OpenAI returned no choice. Full response: ${JSON.stringify(data).slice(0, 500)}`);
  }
  if (choice.finish_reason === "length") {
    throw new Error(
      `OpenAI response was truncated (finish_reason=length). The model hit the ${OPENAI_MAX_TOKENS}-token limit ` +
        "before completing the JSON. Retry, or split the article into a shorter source.",
    );
  }
  // Some reasoning models (observed with minimax/minimax-m3 via OpenRouter) emit
  // the final answer into message.reasoning and leave message.content empty,
  // even though finish_reason is a normal "stop". Fall back to reasoning in
  // that case before giving up.
  const text = (choice?.message?.content || choice?.message?.reasoning || "").trim();
  if (!text) {
    throw new Error(
      `OpenAI returned empty content. finish_reason=${choice.finish_reason}. Full response: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }
  if (!expectJson) return text;
  try {
    return parseJsonLoose(text);
  } catch (err) {
    throw new Error(`OpenAI response was not valid JSON: ${err.message}. Raw: ${text.slice(0, 500)}`);
  }
}

async function callGemini({ model, system, user, expectJson = true }) {
  const apiKey = requireEnv("GEMINI_API_KEY");
  const url = `${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.5,
    },
  };
  if (expectJson) body.generationConfig.responseMimeType = "application/json";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    throw new Error(
      `Gemini returned no candidate. Full response: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }
  // Gemini can finish with reason "SAFETY", "RECITATION", "MAX_TOKENS" with
  // no text content — surface that explicitly so we don't silently get an
  // empty payload.
  const parts = candidate?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("").trim();
  if (!text) {
    throw new Error(
      `Gemini returned empty content. finishReason=${candidate.finishReason}. Full response: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }
  if (!expectJson) return text;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Gemini response was not valid JSON: ${err.message}. Raw: ${text.slice(0, 500)}`,
    );
  }
}

// Prompts -------------------------------------------------------------------

const REWRITE_SYSTEM_ZH = `你是佛山众岩联（ZYL Sintered Stone）的内容编辑，负责把外部公众号文章改写成发布在公司官网"新闻动态"栏目的中文软文。

要求：
- 保留原文核心信息和观点，但用品牌中立、专业、信息密度更高的语气重写。
- 不要出现微信公众号、扫码关注、原作者公众号名、二维码、"点击下方阅读原文"等微信生态特有内容。
- 不要捏造数据、奖项、合作客户。如果原文有数据，照实保留。
- 段落更结构化：使用 h2/h3 小标题分节。每个段落 80-200 字之间。
- 输出为 JSON，schema 见用户消息。

只输出 JSON，不要任何前后说明文字。`;

const TRANSLATE_SYSTEM = (targetLocale) => {
  const targetName =
    targetLocale === "en"
      ? "professional business English"
      : targetLocale === "es"
        ? "professional business Spanish (es-ES)"
        : targetLocale === "ar"
          ? "professional business Arabic (Modern Standard Arabic, suitable for RTL display)"
          : "the target language";
  return `You are translating sintered-stone industry news for ZYL Sintered Stone's corporate website.

Target: ${targetName}.

Rules:
- Translate the meaning, not the words. Output must read naturally to a native business reader in the target language.
- Keep section structure: each input paragraph maps to one output paragraph in the same order, same index.
- Keep h2/h3 headings as headings.
- Industry terms: sintered stone, porcelain slab, large-format slab, marble-look, quartzite-look, etc. — use the locale's standard equivalents.
- Never copy Chinese characters into the output. If a Chinese brand/place name appears, transliterate or translate it.
- Output JSON only, schema as in the user message. No prose around the JSON.`;
};

function buildZhRewriteUserMessage(rawTitle, textBlocks) {
  return `原文标题: ${rawTitle}

原文段落（按顺序）:
${textBlocks
  .map((b, i) => {
    if (b.type === "ul") return `[${i}] (ul) ${b.items.map((it) => `- ${it}`).join(" / ")}`;
    return `[${i}] (${b.type}) ${b.text}`;
  })
  .join("\n")}

请输出以下 JSON：
{
  "title": "改写后的中文标题（25 字以内，吸引点击但不要做党）",
  "excerpt": "中文摘要（80-140 字，列表卡片用）",
  "slug_hint": "english-only-kebab-case-slug（5-8 词，仅小写字母+数字+连字符，描述文章主题）",
  "paragraphs": [
    {"type": "h2"|"h3"|"p"|"ul", "text": "...", "items": ["..."]}
  ]
}

规则：
- paragraphs 的顺序对应原文段落顺序；图片占位会由调用者按原顺序插回，所以你不需要标注图片位置。
- type="ul" 时使用 items 字段，其它类型用 text 字段。
- 段落数量大致和原文一致（可合并相邻的零碎句、可拆分超长段落）。
- title 不要包含品牌名"众岩联"；excerpt 可以提到行业但不要硬塞品牌。`;
}

function buildTranslateUserMessage(zhPayload, targetLocale) {
  return `Source (Chinese):
title: ${zhPayload.title}
excerpt: ${zhPayload.excerpt}

paragraphs:
${zhPayload.paragraphs
  .map((p, i) => {
    if (p.type === "ul") return `[${i}] (ul) ${p.items.map((it) => `- ${it}`).join(" / ")}`;
    return `[${i}] (${p.type}) ${p.text}`;
  })
  .join("\n")}

Output JSON in ${targetLocale}:
{
  "title": "...",
  "excerpt": "...",
  "paragraphs": [
    {"type": "h2"|"h3"|"p"|"ul", "text": "...", "items": ["..."]}
  ]
}

Rules:
- paragraphs array length and types must match the source exactly, in the same order.
- For "ul" entries, output the same number of items in items[].
- Output JSON only, no surrounding text.`;
}

async function rewriteAndTranslate({ provider, model, rawTitle, textBlocks }) {
  console.log(`  LLM: rewriting zh via ${provider}/${model}...`);
  const zh = await callLLM({
    provider,
    model,
    system: REWRITE_SYSTEM_ZH,
    user: buildZhRewriteUserMessage(rawTitle, textBlocks),
  });
  validateLocalePayload("zh", zh, textBlocks.length);

  const result = { zh };
  for (const loc of ["en", "es", "ar"]) {
    console.log(`  LLM: translating → ${loc}...`);
    const out = await callLLM({
      provider,
      model,
      system: TRANSLATE_SYSTEM(loc),
      user: buildTranslateUserMessage(zh, loc),
    });
    validateLocalePayload(loc, out, zh.paragraphs.length);
    result[loc] = out;
  }
  return result;
}

function validateLocalePayload(locale, payload, expectedParagraphCount) {
  if (!payload || typeof payload !== "object") {
    throw new Error(`${locale}: LLM output is not an object`);
  }
  if (typeof payload.title !== "string" || payload.title.length === 0) {
    throw new Error(`${locale}: missing or empty title`);
  }
  if (typeof payload.excerpt !== "string" || payload.excerpt.length === 0) {
    throw new Error(`${locale}: missing or empty excerpt`);
  }
  if (!Array.isArray(payload.paragraphs)) {
    throw new Error(`${locale}: paragraphs must be an array`);
  }
  if (payload.paragraphs.length !== expectedParagraphCount) {
    console.warn(
      `  WARN ${locale}: paragraph count ${payload.paragraphs.length} != source ${expectedParagraphCount} — will still proceed`,
    );
  }
  for (const [i, p] of payload.paragraphs.entries()) {
    if (!p || typeof p !== "object") throw new Error(`${locale}: paragraph[${i}] not an object`);
    if (!["h2", "h3", "p", "ul"].includes(p.type)) {
      throw new Error(`${locale}: paragraph[${i}] invalid type "${p.type}"`);
    }
    if (p.type === "ul") {
      if (!Array.isArray(p.items) || p.items.length === 0) {
        throw new Error(`${locale}: paragraph[${i}] ul missing items`);
      }
    } else if (typeof p.text !== "string" || p.text.length === 0) {
      throw new Error(`${locale}: paragraph[${i}] missing text`);
    }
  }
}

// --- 4. Build blocks for buildLexicalDoc -----------------------------------

// Given the original raw block stream (text + img) and the LLM's rewritten
// text-only paragraphs, reassemble in source order:
//   raw:    [p, img, p, h2, p, img, p]
//   text:   [p, p, h2, p, p]              (img stripped)
//   rewritten paragraphs = LLM output, 1-to-1 with text positions
//   merged: [rewritten[0], image[0], rewritten[1], rewritten[2], rewritten[3], image[1], rewritten[4]]
function mergeTextAndImages(rawBlocks, rewrittenParagraphs, imageMediaIds) {
  const merged = [];
  let textIdx = 0;
  let imgIdx = 0;
  let truncatedTextWarned = false;

  for (const raw of rawBlocks) {
    if (raw.type === "img") {
      const mediaId = imageMediaIds[imgIdx++];
      if (mediaId) merged.push({ type: "image", mediaId });
      continue;
    }
    if (textIdx >= rewrittenParagraphs.length) {
      if (!truncatedTextWarned) {
        console.warn(
          `  WARN LLM produced fewer paragraphs (${rewrittenParagraphs.length}) than source text blocks — dropping trailing source blocks`,
        );
        truncatedTextWarned = true;
      }
      continue;
    }
    merged.push(rewrittenParagraphs[textIdx]);
    textIdx++;
  }
  // Any remaining rewritten paragraphs the LLM added beyond source length:
  // append at the end so we don't silently lose them.
  while (textIdx < rewrittenParagraphs.length) {
    merged.push(rewrittenParagraphs[textIdx]);
    textIdx++;
  }
  return merged;
}

// --- 5. Slug helpers --------------------------------------------------------

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function pickSlug({ cliSlug, llmHint, zhTitle }) {
  if (cliSlug) return slugify(cliSlug);
  if (llmHint) {
    const s = slugify(llmHint);
    if (s.length > 3) return s;
  }
  // Fallback: pinyin of zh title
  const py = pinyin(zhTitle, { toneType: "none", separator: "-", nonZh: "consecutive" });
  const s = slugify(py);
  return s || `news-${Date.now()}`;
}

// --- 6. Main ---------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);
  const apply = args.apply;
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`URL: ${args.url}`);
  console.log(`Provider: ${args.provider}`);
  console.log(`Model: ${args.model}`);
  console.log(`Category: ${args.category}\n`);

  // Step 1: fetch + parse
  console.log("→ Fetching WeChat article...");
  const html = await fetchArticleHtml(args.url);
  const { title: rawTitle, blocks: rawBlocks, imageCount } = parseArticle(html);
  console.log(`  Title (raw): ${rawTitle}`);
  console.log(`  Blocks: ${rawBlocks.length} (${imageCount} images, ${rawBlocks.length - imageCount} text)`);

  if (imageCount === 0) {
    console.error(
      "\nERROR: This article has no images. The News collection requires a cover image, and our policy is to use the article's first image as cover + inline media.\n" +
        "Options:\n" +
        "  1. Pick a different WeChat article that has images.\n" +
        "  2. Manually create a draft in /admin and write the article there.\n",
    );
    process.exit(1);
  }

  // Save debug snapshot if requested.
  if (args.debugDir) {
    await mkdir(args.debugDir, { recursive: true });
    await writeFile(path.join(args.debugDir, "raw.html"), html);
    await writeFile(path.join(args.debugDir, "blocks.json"), JSON.stringify(rawBlocks, null, 2));
    console.log(`  Debug snapshot: ${args.debugDir}`);
  }

  // Step 2: split text vs image streams
  const textBlocks = rawBlocks.filter((b) => b.type !== "img");
  const imageBlocks = rawBlocks.filter((b) => b.type === "img");

  // Step 3: rewrite + translate (this runs before image upload so a model failure
  // doesn't waste R2 writes).
  console.log(`\n→ Rewriting + translating via ${args.provider} (${args.model})...`);
  const localized = await rewriteAndTranslate({
    provider: args.provider,
    model: args.model,
    rawTitle,
    textBlocks,
  });
  console.log(`  zh title: ${localized.zh.title}`);
  console.log(`  en title: ${localized.en.title}`);
  console.log(`  es title: ${localized.es.title}`);
  console.log(`  ar title: ${localized.ar.title}`);

  const slug = pickSlug({
    cliSlug: args.slug,
    llmHint: localized.zh.slug_hint,
    zhTitle: localized.zh.title,
  });
  console.log(`  slug: ${slug}`);

  // Step 4: load Payload, check slug collision early, then download + upload images.
  let payload = null;
  if (apply) {
    console.log("\n→ Booting Payload...");
    const config = (await import("../src/payload.config.ts")).default;
    payload = await getPayload({ config });
    process.on("uncaughtException", (err) => {
      console.error(`  WARN uncaughtException: ${err.message}`);
    });

    const collision = await payload.find({
      collection: "news",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      locale: "zh",
    });
    if (collision.docs[0]) {
      console.error(
        `\nERROR: News slug "${slug}" already exists (id=${collision.docs[0].id}).\n` +
          `Re-run with --slug <different-slug> to override.`,
      );
      process.exit(1);
    }
  }

  // Phase A: download every image, decide which to keep based on size + mime
  // + user-supplied --skip-images list. Anything filtered is gone from both
  // cover and body. Push null at filtered positions so mergeTextAndImages
  // stays positionally aligned.
  console.log("\n→ Downloading images (filter + cover selection)...");
  if (args.skipImages.size > 0) {
    console.log(`  user skip list: ${[...args.skipImages].sort((a, b) => a - b).join(", ")}`);
  }
  const downloads = [];
  for (let i = 0; i < imageBlocks.length; i++) {
    const { src } = imageBlocks[i];
    const indexOneBased = i + 1;
    const label = `[${indexOneBased}/${imageBlocks.length}]`;
    // Print full URL on its own line so the user can copy-paste to a browser
    // for preview before deciding which indices to --skip-images.
    console.log(`  ${label} ${src}`);
    if (args.skipImages.has(indexOneBased)) {
      console.log(`        SKIP (user --skip-images)`);
      downloads.push(null);
      continue;
    }
    try {
      const d = await downloadImage(src);
      const kb = (d.buf.length / 1024).toFixed(0);
      if (d.buf.length < MIN_IMAGE_BYTES) {
        console.log(`        ${kb} KB  ${d.mime}  SKIP (smaller than ${MIN_IMAGE_BYTES} B — likely decoration)`);
        downloads.push(null);
      } else if (FORBIDDEN_IMAGE_MIMES.has(d.mime)) {
        console.log(`        ${kb} KB  ${d.mime}  SKIP (forbidden format)`);
        downloads.push(null);
      } else {
        console.log(`        ${kb} KB  ${d.mime}  KEEP`);
        downloads.push(d);
      }
    } catch (err) {
      console.error(`        FAIL: ${err.message}`);
      downloads.push(null);
    }
  }

  // Cover = first kept image. Since gifs/decorations were already nulled out,
  // any non-null is a valid candidate.
  const coverIndex = downloads.findIndex((d) => d !== null);
  if (coverIndex === -1) {
    console.error(
      "\nERROR: No usable images after filtering. All article images were either too small " +
        `(<${MIN_IMAGE_BYTES} B), in a forbidden format (${[...FORBIDDEN_IMAGE_MIMES].join(", ")}), or failed to download.\n` +
        "Options:\n" +
        "  1. Try a different article that has real content photos.\n" +
        "  2. Manually create the draft in /admin and pick media from R2.\n",
    );
    process.exit(1);
  }
  const keptCount = downloads.filter((d) => d !== null).length;
  console.log(`  → cover = image #${coverIndex + 1} (${downloads[coverIndex].mime})`);
  console.log(`  → keeping ${keptCount}/${imageBlocks.length} images for body`);

  // Phase B: upload kept images (or fill placeholders in dry-run).
  const imageMediaIds = [];
  if (apply) {
    console.log("\n→ Uploading kept images to Payload media (R2)...");
  }
  for (let i = 0; i < downloads.length; i++) {
    const d = downloads[i];
    if (!d) {
      imageMediaIds.push(null);
      continue;
    }
    if (!apply) {
      imageMediaIds.push(`<media-id-${i + 1}>`); // placeholder for dry-run
      continue;
    }
    try {
      const altText = `${localized.en.title} - image ${i + 1}`;
      const uploaded = await uploadImageToPayload(payload, d, { slug, index: i, altText });
      console.log(`  [${i + 1}] uploaded → id=${uploaded.id}  ${uploaded.filename}`);
      imageMediaIds.push(uploaded.id);
    } catch (err) {
      console.error(`  [${i + 1}] UPLOAD FAIL: ${err.message}`);
      imageMediaIds.push(null);
    }
  }

  // Re-validate cover after upload (in apply mode the chosen index might have failed to upload).
  let coverMediaId = imageMediaIds[coverIndex];
  if (apply && !coverMediaId) {
    // Fallback: scan for the next valid uploaded id. Filtered images are
    // already null at this point, so any non-null id is acceptable.
    for (let i = 0; i < imageMediaIds.length; i++) {
      const id = imageMediaIds[i];
      if (!id) continue;
      coverMediaId = id;
      console.log(`  WARN cover fell back to image #${i + 1} (original cover upload failed)`);
      break;
    }
    if (!coverMediaId) {
      console.error("\nERROR: Cover image upload failed and no fallback was usable. Aborting.");
      process.exit(1);
    }
  }

  // Step 5: build merged blocks per locale, then Lexical docs.
  console.log("\n→ Building Lexical docs...");
  const lexicalPerLocale = {};
  for (const loc of ALLOWED_LOCALES) {
    const merged = mergeTextAndImages(rawBlocks, localized[loc].paragraphs, imageMediaIds);
    lexicalPerLocale[loc] = {
      doc: buildLexicalDoc(merged, { rtl: RTL_LOCALES.has(loc) }),
      blockCount: merged.length,
    };
    console.log(`  ${loc}: ${merged.length} blocks`);
  }

  // Step 6: write to Payload (or dry-run summary).
  if (!apply) {
    console.log(`\n=== DRY-RUN SUMMARY ===`);
    console.log(`Would create News draft:`);
    console.log(`  slug:         ${slug}`);
    console.log(`  category:     ${args.category}`);
    console.log(`  _status:      draft`);
    console.log(`  cover:        <first image upload>`);
    console.log(`  publishedAt:  ${new Date().toISOString()}`);
    for (const loc of ALLOWED_LOCALES) {
      console.log(`  ${loc} title: ${localized[loc].title}`);
    }
    console.log(`\nImages: ${imageBlocks.length} total, ${keptCount} to upload (rest filtered), cover = image #${coverIndex + 1}`);
    console.log(`\nRun with --apply to execute.`);
    return;
  }

  console.log("\n→ Writing News draft to Payload...");
  const created = await payload.create({
    collection: "news",
    locale: "zh",
    draft: true,
    data: {
      slug,
      publishedAt: new Date().toISOString(),
      category: args.category,
      coverImage: coverMediaId,
      title: localized.zh.title,
      excerpt: localized.zh.excerpt,
      body: lexicalPerLocale.zh.doc,
    },
  });
  console.log(`  CREATED news id=${created.id} (draft)`);

  for (const loc of ["en", "es", "ar"]) {
    await payload.update({
      collection: "news",
      id: created.id,
      locale: loc,
      draft: true,
      data: {
        title: localized[loc].title,
        excerpt: localized[loc].excerpt,
        body: lexicalPerLocale[loc].doc,
      },
    });
    console.log(`    + locale ${loc}`);
  }

  console.log(`\n=== DONE ===`);
  console.log(`News draft created. Review and publish in admin:`);
  const adminBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  console.log(`  ${adminBase}/admin/collections/news/${created.id}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.stack) console.error(err.stack.split("\n").slice(0, 6).join("\n"));
  process.exit(1);
});
