#!/usr/bin/env node
// One-shot: import the August independent-site articles from
// docs/8月独立站文章素材 / into Payload `news` as 4-locale drafts.
//
// Source: one docx (8 articles) + images/videos named 文章N图M.
// Chinese body is kept as written. en/es/ar are translated, not rewritten.
// Cover = 文章N图一 (still). 图一 still is not repeated in the body.
// Article 8's 图一.mp4 is inserted at the top of the body.
//
// Usage:
//   node --env-file=.env.local scripts/importAugNewsDrafts.mjs
//   node --env-file=.env.local scripts/importAugNewsDrafts.mjs --apply
//   node --env-file=.env.local scripts/importAugNewsDrafts.mjs --parse-only
//   node --env-file=.env.local scripts/importAugNewsDrafts.mjs --only 1,8
//   node --env-file=.env.local scripts/importAugNewsDrafts.mjs --apply --model gemini-2.5-flash

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { getPayload } from "payload";

import { buildLexicalDoc } from "./seoArticles/lexical.mjs";
import { parseJsonLoose } from "../src/features/news/lib/looseJson.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_PATH = "/tmp/aug-news-i18n.json";
const ALLOWED_LOCALES = ["zh", "en", "es", "ar"];
const RTL_LOCALES = new Set(["ar"]);
const CN_NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8 };
const HAS_CHINESE = /[\u3400-\u9fff]/;

const DEFAULT_MODEL = "qwen/qwen-2.5-72b-instruct";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_DEFAULT_BASE_URL = "https://openrouter.ai/api";
const OPENAI_MAX_TOKENS = 16_000;

const ARTICLES_META = {
  1: {
    slug: "overseas-sintered-stone-procurement-beyond-unit-price",
    title: "海外岩板采购，别只盯着每平方米的价格",
    publishedAt: "2026-08-04T09:30:00.000Z",
    category: "industry",
    excerpt:
      "做海外岩板项目时，采购通常会先比较价格。但真正的采购成本并不只是报价单上的数字。询价时除了单价，还要一起看供应商是否集中、文件是否齐全、包装装柜和后续配套。",
  },
  2: {
    slug: "sintered-stone-inspection-surface-details",
    title: "岩板验收别只看花色：这些表面细节更值得关注",
    publishedAt: "2026-08-07T09:30:00.000Z",
    category: "industry",
    excerpt:
      "岩板验收不能只看花色好不好看。小气泡、小黑点、表面平整度这些细节，在大面积铺贴后更容易被放大。批量项目更需要从生产阶段就开始确认样品标准和整批一致性。",
  },
  3: {
    slug: "is-sintered-stone-fragile-thickness-is-not-enough",
    title: "岩板易碎吗？厚度并不是唯一需要关注的因素",
    publishedAt: "2026-08-11T09:30:00.000Z",
    category: "industry",
    excerpt:
      "岩板出现崩边、开裂时，不能只从厚度判断。内部结构、坯体质量和生产稳定性，往往比毫米数更能决定切割、开孔和磨边的实际表现。",
  },
  4: {
    slug: "sintered-stone-selection-lead-time-supply-stability",
    title: "海外岩板选材，不要只看花色：交期与供应稳定性同样重要",
    publishedAt: "2026-08-14T09:30:00.000Z",
    category: "industry",
    excerpt:
      "海外选材不能只看花色。交期、库存、装柜效率和补货能力，同样决定项目能不能按计划落地。好看的岩板只是开始，稳定供应才决定能否交付。",
  },
  5: {
    slug: "sintered-stone-procurement-total-project-cost",
    title: "岩板采购别只看最低价：还要计算加工、安装和售后成本",
    publishedAt: "2026-08-18T09:30:00.000Z",
    category: "industry",
    excerpt:
      "最低采购价不一定是最低项目成本。加工损耗、安装人工和售后补货，都应该算进岩板采购评估。真正的低成本，来自更少的损耗、返工和不可控费用。",
  },
  6: {
    slug: "large-format-sintered-stone-transport-and-installation",
    title: "大规格岩板选材别只看花色：运输与安装同样重要",
    publishedAt: "2026-08-21T09:30:00.000Z",
    category: "industry",
    excerpt:
      "大规格岩板选的不只是外观。板材结构、抗折性能、运输搬运和现场安装条件，都要和花色一起确认。规格越大，前期准备越重要。",
  },
  7: {
    slug: "how-to-compare-sintered-stone-project-quotes",
    title: "岩板工程报价怎么比较？不要只看每平方米单价",
    publishedAt: "2026-08-25T09:30:00.000Z",
    category: "industry",
    excerpt:
      "工程报价不能只比每平方米单价。尺寸排版、应用场景、批次稳定性和报价包含内容，都会改变最终项目成本。先统一采购条件，再比较价格。",
  },
  8: {
    slug: "sintered-stone-supplier-capacity-beyond-factory",
    title: "岩板采购别只问“是不是工厂”：供应能力同样重要",
    publishedAt: "2026-08-28T09:30:00.000Z",
    category: "industry",
    excerpt:
      "确认供应商是不是工厂只是第一步。品质稳定、真实库存、持续供货和清晰交付，才是工程采购更需要验证的能力。",
  },
};

function parseArgs(argv) {
  const args = { apply: false, parseOnly: false, only: null, model: DEFAULT_MODEL, provider: "openai", i18n: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") args.apply = true;
    else if (a === "--parse-only") args.parseOnly = true;
    else if (a === "--i18n") args.i18n = argv[++i];
    else if (a === "--only") {
      args.only = new Set(
        String(argv[++i] || "")
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => n >= 1 && n <= 8),
      );
    } else if (a === "--model") args.model = argv[++i];
    else if (a === "--provider") args.provider = String(argv[++i] || "").toLowerCase();
  }
  const looksLikeOpenRouter = String(args.model).includes("/");
  if (looksLikeOpenRouter) args.provider = "openai";
  else if (/gemini/i.test(args.model)) args.provider = "gemini";
  else if (args.provider !== "gemini" && args.provider !== "openai") {
    args.provider = "openai";
  }
  return args;
}

function findSourceDir() {
  const docsDir = path.join(ROOT, "docs");
  const name = readdirSync(docsDir).find((n) => n.startsWith("8月独立站文章素材"));
  if (!name) throw new Error(`Cannot find 8月独立站文章素材 under ${docsDir}`);
  return path.join(docsDir, name);
}

function extractDocxMarkdown(docxPath) {
  return execFileSync("pandoc", [docxPath, "-t", "markdown", "--wrap=none"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function listMediaFiles(dir) {
  const byArticle = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };
  for (const name of readdirSync(dir)) {
    const m = name.match(/^文章([一二三四五六七八])图([一二三四五六七八])(.*)\.(png|jpe?g|mp4)$/i);
    if (!m) continue;
    const article = CN_NUM[m[1]];
    const slot = CN_NUM[m[2]];
    const ext = m[4].toLowerCase();
    byArticle[article].push({
      name,
      path: path.join(dir, name),
      slot,
      note: m[3] || "",
      ext,
      isVideo: ext === "mp4",
    });
  }
  for (const n of Object.keys(byArticle)) {
    byArticle[n].sort((a, b) => a.slot - b.slot || Number(a.isVideo) - Number(b.isVideo));
  }
  return byArticle;
}

function stripPandocAttrs(s) {
  return String(s || "").replace(/\{[^{}]*\b(?:width|height)=[^{}]*\}/g, "");
}

function cleanTitle(s) {
  return stripPandocAttrs(s)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/^#+\s*/, "")
    .replace(/^\*+\s*|\s*\*+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanMarkdownText(s) {
  return stripPandocAttrs(s)
    .replace(/^#+\s*/, "")
    .replace(/\\$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBrandFooter(line) {
  return /ZYL Sintered Stone/.test(line) && /Industry Insights/.test(line);
}

function splitArticles(md) {
  const re = /文章([一二三四五六七八])[：:]/g;
  const starts = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(md))) {
    const n = CN_NUM[m[1]];
    if (seen.has(n)) continue;
    seen.add(n);
    starts.push({ n, index: m.index, endMarker: m.index + m[0].length });
  }
  starts.sort((a, b) => a.index - b.index);
  if (starts.length !== 8) {
    throw new Error(`Expected 8 article markers, found ${starts.length}: ${starts.map((s) => s.n).join(",")}`);
  }
  return starts.map((s, i) => {
    const next = starts[i + 1];
    return { n: s.n, raw: md.slice(s.endMarker, next ? next.index : md.length) };
  });
}

function extractTitleAndBody(raw) {
  const lines = raw.split("\n");
  let title = "";
  let bodyStart = 0;
  const leadingImages = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed === "*" || /^#+\s*\*?$/.test(trimmed) || isBrandFooter(trimmed)) {
      bodyStart = i + 1;
      continue;
    }
    const candidate = cleanTitle(trimmed);
    if (candidate) {
      title = candidate;
      const imgRe = /!\[([^\]]*)\]\([^)]+\)/g;
      let m;
      while ((m = imgRe.exec(trimmed))) leadingImages.push(m[1] || "");
      bodyStart = i + 1;
      break;
    }
  }
  if (!title) throw new Error("Could not extract article title");
  const prefix = leadingImages.map((alt) => `![${alt}](media/title-cover)`).join("\n");
  const rest = lines.slice(bodyStart).join("\n");
  return { title, body: prefix ? `${prefix}\n${rest}` : rest };
}

function emitTextAndImages(blocks, type, line) {
  const re = /!\[([^\]]*)\]\([^)]+\)/g;
  let last = 0;
  let m;
  const parts = [];
  while ((m = re.exec(line))) {
    const before = line.slice(last, m.index);
    if (before.trim()) parts.push({ kind: "text", text: cleanMarkdownText(before) });
    parts.push({ kind: "img", alt: m[1] || "" });
    last = m.index + m[0].length;
  }
  const after = line.slice(last);
  if (after.trim()) parts.push({ kind: "text", text: cleanMarkdownText(after) });

  for (const part of parts) {
    if (part.kind === "img") {
      blocks.push({ type: "img", alt: part.alt });
      continue;
    }
    if (!part.text) continue;
    if (!part.text || /^[\s{}]*$/.test(part.text)) continue;
    blocks.push({ type, text: part.text });
  }
}

function parseBody(body) {
  const blocks = [];
  const lines = body.split("\n");
  let ulItems = [];

  const flushUl = () => {
    if (ulItems.length === 0) return;
    blocks.push({ type: "ul", items: ulItems });
    ulItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (line.endsWith("\\") && i + 1 < lines.length) {
      line = line.slice(0, -1) + lines[++i];
    }
    const trimmed = line.trim();
    if (!trimmed) {
      flushUl();
      continue;
    }
    if (isBrandFooter(trimmed) || /^#+\s*ZYL/.test(trimmed) || trimmed === "*" || /^#+\s*\*?$/.test(trimmed)) {
      flushUl();
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      flushUl();
      emitTextAndImages(blocks, "h2", trimmed.replace(/^##\s+/, ""));
      continue;
    }
    if (/^[-*]\s+/.test(trimmed) && !trimmed.startsWith("**") && !trimmed.startsWith("*ZYL")) {
      const item = cleanMarkdownText(trimmed.replace(/^[-*]\s+/, ""));
      if (item) ulItems.push(item);
      continue;
    }
    flushUl();
    emitTextAndImages(blocks, "p", trimmed);
  }
  flushUl();
  return blocks;
}

function assignMedia(articleN, blocks, files) {
  const stills = files.filter((f) => !f.isVideo);
  const videos = files.filter((f) => f.isVideo);
  const used = new Set();

  const takeByAlt = (alt) => {
    const normalized = String(alt || "").replace("吧", "八");
    const m = normalized.match(/文章([一二三四五六七八])图([一二三四五六七八])/);
    if (!m) return null;
    const slot = CN_NUM[m[2]];
    const hit = stills.find((f) => f.slot === slot && !used.has(f.name));
    if (!hit) return null;
    used.add(hit.name);
    return hit;
  };

  const takeNext = () => {
    const hit = stills.find((f) => !used.has(f.name));
    if (!hit) return null;
    used.add(hit.name);
    return hit;
  };

  const out = [];
  for (const block of blocks) {
    if (block.type !== "img") {
      out.push(block);
      continue;
    }
    const file = takeByAlt(block.alt) || takeNext();
    if (!file) {
      throw new Error(`Article ${articleN}: could not map image alt="${block.alt}"`);
    }
    out.push({
      type: "media",
      file: file.name,
      path: file.path,
      slot: file.slot,
      isVideo: false,
    });
  }

  const unusedStills = stills.filter((f) => !used.has(f.name));
  if (unusedStills.length > 0) {
    throw new Error(
      `Article ${articleN}: unused stills ${unusedStills.map((f) => f.name).join(", ")}`,
    );
  }

  for (const video of videos) {
    const videoBlock = {
      type: "media",
      file: video.name,
      path: video.path,
      slot: video.slot,
      isVideo: true,
    };
    const coverStill = out.findIndex((b) => b.type === "media" && b.slot === video.slot && !b.isVideo);
    if (coverStill >= 0) out.splice(coverStill + 1, 0, videoBlock);
    else out.unshift(videoBlock);
  }

  const cover = stills.find((f) => f.slot === 1) || stills[0];
  if (!cover) throw new Error(`Article ${articleN}: no cover still`);

  const body = out.filter((b) => !(b.type === "media" && !b.isVideo && b.file === cover.name));

  return { cover, body };
}

function parseSource() {
  const sourceDir = findSourceDir();
  const docx = path.join(sourceDir, "8月独立站文章.docx");
  if (!existsSync(docx)) throw new Error(`Missing docx: ${docx}`);
  const md = stripPandocAttrs(extractDocxMarkdown(docx));
  const media = listMediaFiles(sourceDir);
  const parts = splitArticles(md);

  return parts.map(({ n, raw }) => {
    const meta = ARTICLES_META[n];
    const { body } = extractTitleAndBody(raw);
    const rawBlocks = parseBody(body);
    const { cover, body: bodyBlocks } = assignMedia(n, rawBlocks, media[n]);
    const coalesced = mergeAdjacentUls(coalesceParagraphs(bodyBlocks));
    return {
      n,
      slug: meta.slug,
      publishedAt: meta.publishedAt,
      category: meta.category,
      excerpt: meta.excerpt,
      title: meta.title,
      cover,
      blocks: coalesced,
      mediaFiles: media[n],
    };
  });
}

function mergeAdjacentUls(blocks) {
  const out = [];
  for (const block of blocks) {
    const prev = out[out.length - 1];
    if (block.type === "ul" && prev?.type === "ul") {
      prev.items.push(...block.items);
      continue;
    }
    if (block.type === "ul") out.push({ type: "ul", items: [...block.items] });
    else out.push({ ...block });
  }
  return out;
}

function coalesceParagraphs(blocks, maxChars = 220) {
  const out = [];
  for (const block of blocks) {
    const prev = out[out.length - 1];
    if (
      block.type === "p" &&
      prev?.type === "p" &&
      prev.text.length + block.text.length + 1 <= maxChars
    ) {
      prev.text = `${prev.text} ${block.text}`;
      continue;
    }
    if (block.type === "ul" && prev?.type === "ul") {
      prev.items.push(...block.items);
      continue;
    }
    if (block.type === "ul") out.push({ type: "ul", items: [...block.items] });
    else out.push({ ...block });
  }
  return out;
}

function textBlocksOf(blocks) {
  return blocks.filter((b) => b.type === "h2" || b.type === "h3" || b.type === "p" || b.type === "ul");
}

function summarizeArticle(article) {
  const text = textBlocksOf(article.blocks);
  const media = article.blocks.filter((b) => b.type === "media");
  return {
    n: article.n,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    cover: article.cover.name,
    publishedAt: article.publishedAt,
    category: article.category,
    textBlocks: text.length,
    mediaInBody: media.map((m) => m.file),
    headings: text.filter((b) => b.type === "h2").map((b) => b.text),
  };
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

async function callOpenAI({ model, system, user }) {
  const apiKey = requireEnv("WECHAT_OPENAI_API_KEY");
  const base = (process.env.WECHAT_OPENAI_BASE_URL || OPENAI_DEFAULT_BASE_URL).replace(/\/+$/, "");
  const url = `${base}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: OPENAI_MAX_TOKENS,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const choice = data?.choices?.[0];
  const text = (choice?.message?.content || choice?.message?.reasoning || "").trim();
  if (!text) throw new Error(`OpenAI empty content. finish_reason=${choice?.finish_reason}`);
  return parseJsonLoose(text);
}

async function callGemini({ model, system, user }) {
  const apiKey = requireEnv("GEMINI_API_KEY");
  const url = `${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts || []).map((p) => p.text || "").join("").trim();
  if (!text) {
    throw new Error(`Gemini empty content. finishReason=${candidate?.finishReason}`);
  }
  return JSON.parse(text);
}

async function callLLM({ provider, model, system, user }) {
  if (provider === "openai") return callOpenAI({ model, system, user });
  return callGemini({ model, system, user });
}

function translateSystem(targetLocale, expectedCount) {
  const targetName =
    targetLocale === "en"
      ? "professional business English"
      : targetLocale === "es"
        ? "professional business Spanish (es-ES)"
        : "professional business Arabic (Modern Standard Arabic, suitable for RTL display)";
  return `You are translating sintered-stone industry articles for ZYL Sintered Stone's corporate website (zylsinteredstone.com).

Target: ${targetName}.

Rules:
- Faithful translation of meaning. Do not rewrite, shorten, or add new claims.
- paragraphs MUST contain exactly ${expectedCount} items. Same types, same order, same indexes. Do not merge or split.
- Keep h2 headings as headings.
- For "ul" entries, keep the same number of items.
- Keep emphasis: wrap the same phrases in **bold** where the source uses **bold**.
- Industry terms: 岩板 = sintered stone; 大规格 = large-format; 奢石 = luxury stone / quartzite-look; 装柜 = container loading; 现货 = stock / ex-stock.
- Brand name stays "ZYL Sintered Stone". Keep the figure 2,000,000㎡ as 2,000,000 m².
- Never copy Chinese characters into the output.
- Output JSON only.`;
}

function translateUserMessage(zhPayload, targetLocale) {
  return `Source (Chinese):
title: ${zhPayload.title}
excerpt: ${zhPayload.excerpt}

paragraphs (exactly ${zhPayload.paragraphs.length} items; copy this length):
${zhPayload.paragraphs
  .map((p, i) => {
    if (p.type === "ul") return `[${i}] (ul) ${p.items.map((it) => `- ${it}`).join(" / ")}`;
    return `[${i}] (${p.type}) ${p.text}`;
  })
  .join("\n")}

Output JSON in ${targetLocale} with paragraphs.length === ${zhPayload.paragraphs.length}:
{
  "title": "...",
  "excerpt": "...",
  "paragraphs": [
    {"type": "h2"|"h3"|"p"|"ul", "text": "...", "items": ["..."]}
  ]
}`;
}

function validateLocalePayload(locale, payload, expectedCount, { requireExactCount = true } = {}) {
  if (!payload || typeof payload !== "object") throw new Error(`${locale}: not an object`);
  if (typeof payload.title !== "string" || !payload.title.trim()) throw new Error(`${locale}: empty title`);
  if (typeof payload.excerpt !== "string" || !payload.excerpt.trim()) throw new Error(`${locale}: empty excerpt`);
  if (!Array.isArray(payload.paragraphs)) throw new Error(`${locale}: paragraphs not an array`);
  if (requireExactCount && payload.paragraphs.length !== expectedCount) {
    throw new Error(`${locale}: paragraph count ${payload.paragraphs.length} != ${expectedCount}`);
  }
  if (payload.paragraphs.length === 0) throw new Error(`${locale}: paragraphs empty`);
  for (const [i, p] of payload.paragraphs.entries()) {
    if (!["h2", "h3", "p", "ul"].includes(p?.type)) {
      throw new Error(`${locale}: paragraph[${i}] invalid type ${p?.type}`);
    }
    if (p.type === "ul") {
      if (!Array.isArray(p.items) || p.items.length === 0) {
        const fromText = typeof p.text === "string"
          ? p.text.split(/\n|[•·]|^\s*-\s+/m).map((s) => s.trim()).filter(Boolean)
          : [];
        if (fromText.length === 0) {
          throw new Error(`${locale}: paragraph[${i}] ul missing items`);
        }
        p.items = fromText;
      }
    } else if (typeof p.text !== "string" || !p.text.trim()) {
      throw new Error(`${locale}: paragraph[${i}] missing text`);
    }
  }
  if (locale !== "zh" && HAS_CHINESE.test(JSON.stringify(payload))) {
    throw new Error(`${locale}: contains Chinese characters`);
  }
}

function sourceHash(article) {
  const text = textBlocksOf(article.blocks);
  return createHash("sha1")
    .update(JSON.stringify({ title: article.title, excerpt: article.excerpt, text }))
    .digest("hex");
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function withRetry(label, fn, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`  WARN ${label} attempt ${i}/${attempts}: ${err.message}`);
      if (i < attempts) await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
  throw lastErr;
}

async function translateArticle(article, { provider, model, cache }) {
  const text = textBlocksOf(article.blocks);
  const zhPayload = {
    title: article.title,
    excerpt: article.excerpt,
    paragraphs: text.map((b) => (b.type === "ul" ? { type: "ul", items: b.items } : { type: b.type, text: b.text })),
  };
  const hash = sourceHash(article);
  const localized = { zh: zhPayload };

  for (const loc of ["en", "es", "ar"]) {
    const cacheKey = `${article.slug}:${loc}:${hash}:${model}`;
    if (cache[cacheKey]) {
      validateLocalePayload(loc, cache[cacheKey], text.length, { requireExactCount: false });
      localized[loc] = cache[cacheKey];
      console.log(`  ${loc}: cache hit (${cache[cacheKey].paragraphs.length} paras)`);
      continue;
    }
    console.log(`  LLM: translating → ${loc} via ${provider}/${model}...`);
    const out = await withRetry(`${article.slug}/${loc}`, async () => {
      const payload = await callLLM({
        provider,
        model,
        system: translateSystem(loc, text.length),
        user: translateUserMessage(zhPayload, loc),
      });
      validateLocalePayload(loc, payload, text.length, { requireExactCount: false });
      payload.paragraphs = mergeAdjacentUls(payload.paragraphs);
      if (payload.paragraphs.length !== text.length) {
        console.warn(`  WARN ${loc}: paragraph count ${payload.paragraphs.length} != ${text.length}`);
      }
      return payload;
    });
    cache[cacheKey] = out;
    await saveCache(cache);
    localized[loc] = out;
    console.log(`  ${loc} title: ${out.title} (${out.paragraphs.length} paras)`);
  }
  return localized;
}

function mergeLocalizedBlocks(sourceBlocks, paragraphs) {
  const media = [];
  let textsBefore = 0;
  for (const raw of sourceBlocks) {
    if (raw.type === "media") media.push({ block: raw, afterText: textsBefore });
    else textsBefore += 1;
  }

  const merged = [];
  let mediaIdx = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    while (mediaIdx < media.length && media[mediaIdx].afterText === i) {
      merged.push(media[mediaIdx].block);
      mediaIdx += 1;
    }
    merged.push(paragraphs[i]);
  }
  while (mediaIdx < media.length) {
    merged.push(media[mediaIdx].block);
    mediaIdx += 1;
  }
  return merged;
}

async function prepareUpload(filePath, isVideo) {
  if (isVideo) {
    const buf = await readFile(filePath);
    return { buf, mime: "video/mp4", ext: "mp4" };
  }
  const buf = await sharp(filePath, { limitInputPixels: 8192 * 8192 })
    .rotate()
    .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { buf, mime: "image/jpeg", ext: "jpg" };
}

async function uploadMedia(payload, { buf, mime, ext }, { slug, index, alt }) {
  const filename = `news-${slug}-${String(index + 1).padStart(2, "0")}.${ext}`;
  const created = await payload.create({
    collection: "media",
    data: {
      alt,
      category: "other",
    },
    file: {
      data: buf,
      mimetype: mime,
      name: filename,
      size: buf.length,
    },
    overrideAccess: true,
  });
  return { id: created.id, filename, url: created.url };
}

async function findExistingBySlug(payload, slug) {
  const r = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: "zh",
    draft: true,
    overrideAccess: true,
  });
  return r.docs[0] || null;
}

function materialize(blocks, mediaIdsByFile) {
  return blocks.map((b) => {
    if (b.type === "media") {
      const id = mediaIdsByFile.get(b.file);
      if (!id) throw new Error(`Missing uploaded media for ${b.file}`);
      return { type: "image", mediaId: id };
    }
    return b;
  });
}

async function writeDraft(payload, article, localized, mediaIdsByFile, coverId) {
  const existing = await findExistingBySlug(payload, article.slug);
  if (existing?._status === "published") {
    throw new Error(`slug "${article.slug}" is already published (id=${existing.id}); refusing to overwrite`);
  }

  const lexical = {};
  for (const loc of ALLOWED_LOCALES) {
    const merged = materialize(mergeLocalizedBlocks(article.blocks, localized[loc].paragraphs), mediaIdsByFile);
    lexical[loc] = buildLexicalDoc(merged, { rtl: RTL_LOCALES.has(loc) });
  }

  const zhData = {
    slug: article.slug,
    publishedAt: article.publishedAt,
    category: article.category,
    coverImage: coverId,
    title: localized.zh.title,
    excerpt: localized.zh.excerpt,
    body: lexical.zh,
  };

  let id;
  if (existing) {
    await payload.update({
      collection: "news",
      id: existing.id,
      locale: "zh",
      draft: true,
      overrideAccess: true,
      data: zhData,
    });
    id = existing.id;
    console.log(`  UPDATED draft id=${id}`);
  } else {
    const created = await payload.create({
      collection: "news",
      locale: "zh",
      draft: true,
      overrideAccess: true,
      data: zhData,
    });
    id = created.id;
    console.log(`  CREATED draft id=${id}`);
  }

  for (const loc of ["en", "es", "ar"]) {
    await payload.update({
      collection: "news",
      id,
      locale: loc,
      draft: true,
      overrideAccess: true,
      data: {
        title: localized[loc].title,
        excerpt: localized[loc].excerpt,
        body: lexical[loc],
      },
    });
    console.log(`    + locale ${loc}`);
  }
  return id;
}

async function main() {
  const args = parseArgs(process.argv);
  console.log(`Mode: ${args.parseOnly ? "PARSE-ONLY" : args.apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`Provider: ${args.provider}`);
  console.log(`Model: ${args.model}\n`);

  const articles = parseSource().filter((a) => !args.only || args.only.has(a.n));
  for (const article of articles) {
    const s = summarizeArticle(article);
    console.log(`=== 文章${article.n} ${s.slug} ===`);
    console.log(`  title: ${s.title}`);
    console.log(`  excerpt: ${s.excerpt}`);
    console.log(`  cover: ${s.cover}`);
    console.log(`  publishedAt: ${s.publishedAt}`);
    console.log(`  text blocks: ${s.textBlocks}`);
    console.log(`  body media: ${s.mediaInBody.join(", ") || "(none)"}`);
    console.log(`  headings:`);
    for (const h of s.headings) console.log(`    - ${h}`);
    console.log("");
  }

  if (args.parseOnly) {
    const dump = articles.map((article) => ({
      n: article.n,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      publishedAt: article.publishedAt,
      category: article.category,
      cover: article.cover.name,
      paragraphs: textBlocksOf(article.blocks).map((b) =>
        b.type === "ul" ? { type: "ul", items: b.items } : { type: b.type, text: b.text },
      ),
      media: article.blocks.filter((b) => b.type === "media").map((b) => ({
        file: b.file,
        slot: b.slot,
        isVideo: b.isVideo,
      })),
    }));
    await writeFile("/tmp/aug-news-zh.json", JSON.stringify(dump, null, 2));
    console.log("Parse OK. Wrote /tmp/aug-news-zh.json");
    console.log("Re-run without --parse-only to translate; add --apply to write drafts.");
    return;
  }

  const cache = await loadCache();
  const localizedBySlug = {};
  const prebuilt = args.i18n ? JSON.parse(await readFile(args.i18n, "utf8")) : null;
  for (const article of articles) {
    const text = textBlocksOf(article.blocks);
    const zhPayload = {
      title: article.title,
      excerpt: article.excerpt,
      paragraphs: text.map((b) => (b.type === "ul" ? { type: "ul", items: b.items } : { type: b.type, text: b.text })),
    };
    if (prebuilt?.[article.slug]) {
      console.log(`→ Using prebuilt i18n for 文章${article.n} (${article.slug})`);
      const loc = { zh: zhPayload };
      for (const locale of ["en", "es", "ar"]) {
        const payload = prebuilt[article.slug][locale];
        const normalized = {
          ...payload,
          paragraphs: mergeAdjacentUls(payload.paragraphs),
        };
        validateLocalePayload(locale, normalized, text.length, { requireExactCount: false });
        loc[locale] = normalized;
        console.log(`  ${locale} title: ${normalized.title} (${normalized.paragraphs.length} paras)`);
      }
      localizedBySlug[article.slug] = loc;
      continue;
    }
    console.log(`→ Translating 文章${article.n} (${article.slug})`);
    localizedBySlug[article.slug] = await translateArticle(article, {
      provider: args.provider,
      model: args.model,
      cache,
    });
  }

  if (!args.apply) {
    console.log("\n=== DRY-RUN SUMMARY ===");
    console.log(`Would create/update ${articles.length} News drafts (zh/en/es/ar).`);
    for (const article of articles) {
      const loc = localizedBySlug[article.slug];
      console.log(`  ${article.slug}`);
      console.log(`    zh: ${loc.zh.title}`);
      console.log(`    en: ${loc.en.title}`);
      console.log(`    es: ${loc.es.title}`);
      console.log(`    ar: ${loc.ar.title}`);
    }
    console.log(`\nTranslation cache: ${CACHE_PATH}`);
    console.log("Run with --apply to upload media and write drafts.");
    return;
  }

  console.log("\n→ Booting Payload...");
  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });
  process.on("uncaughtException", (err) => {
    console.error(`  WARN uncaughtException: ${err.message}`);
  });

  const results = [];
  for (const article of articles) {
    console.log(`\n→ Importing 文章${article.n} ${article.slug}`);
    const localized = localizedBySlug[article.slug];
    const uploadList = [];
    uploadList.push({ ...article.cover, role: "cover" });
    for (const block of article.blocks) {
      if (block.type === "media") uploadList.push({ ...block, role: "body" });
    }

    const mediaIdsByFile = new Map();
    let coverId = null;
    for (let i = 0; i < uploadList.length; i++) {
      const item = uploadList[i];
      if (mediaIdsByFile.has(item.file || item.name)) {
        if (item.role === "cover") coverId = mediaIdsByFile.get(item.file || item.name);
        continue;
      }
      const fileName = item.file || item.name;
      const prepared = await prepareUpload(item.path, Boolean(item.isVideo));
      const kb = (prepared.buf.length / 1024).toFixed(0);
      const alt = `${localized.zh.title} · ${item.isVideo ? "视频" : `图${item.slot}`}`;
      const uploaded = await uploadMedia(payload, prepared, {
        slug: article.slug,
        index: i,
        alt,
      });
      mediaIdsByFile.set(fileName, uploaded.id);
      if (item.role === "cover") coverId = uploaded.id;
      console.log(`  [${i + 1}/${uploadList.length}] ${fileName} → ${uploaded.filename} ${kb}KB id=${uploaded.id}`);
    }
    if (!coverId) throw new Error(`${article.slug}: cover upload missing`);

    const id = await writeDraft(payload, article, localized, mediaIdsByFile, coverId);
    results.push({ n: article.n, slug: article.slug, id });
  }

  console.log("\n=== DONE ===");
  const adminBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  for (const r of results) {
    console.log(`  文章${r.n}  ${r.slug}`);
    console.log(`    ${adminBase}/admin/collections/news/${r.id}`);
  }
  console.log("\nAll 8 are drafts. Open admin and click Publish when ready.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.stack) console.error(err.stack.split("\n").slice(0, 12).join("\n"));
  process.exit(1);
});
