#!/usr/bin/env node
/**
 * 读取 Haiku 工作流写出的草稿(/tmp/hb-out/out-*.json)，校验 4 语言纯净度后写入 Payload。
 * 仅给「仍无描述」的产品写(幂等)，每 locale 单独 update(与旧产品/国际化一致)。
 * 用法:
 *   node --env-file=.env.local scripts/applyHaikuDrafts.mjs            # dry-run(只校验+统计)
 *   node --env-file=.env.local scripts/applyHaikuDrafts.mjs --apply
 *   ...flags: --overwrite  --dir=/tmp/hb-out
 * 语义注意：产品只要「任一 locale 已有描述」就整体跳过（--overwrite 才覆盖），保护存量；
 * 要「逐 locale 只填空行」（zh-only 产品补齐其余语言），用 fillDescriptionsSQL.mjs。
 */
import fs from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import {
  PRODUCT_COPY_LOCALES,
  hasAnyLocalizedDescription,
} from "../src/features/products/lib/productCopyGeneration.mts";
import { validateCopyPurity } from "../src/features/products/lib/copyPurity.ts";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const OVERWRITE = args.includes("--overwrite");
const DIR = (args.find((a) => a.startsWith("--dir=")) || "").split("=")[1] || "/tmp/hb-out";
const OUT = path.join(process.cwd(), "docs/copywriting/haiku-drafts.json");

// 纯净度校验共享自 src/features/products/lib/copyPurity.ts（与 fillDescriptionsSQL.mjs 同源）

// 1) 汇总草稿 —— 同 slug 多副本时「合格版本」优先, 不让坏副本覆盖好副本
const drafts = new Map(); // slug -> {o, good}
let files = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!/^out-\d+\.json$/.test(f)) continue;
  files++;
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); } catch { console.log(`  坏文件 ${f}`); continue; }
  for (const d of arr || []) {
    if (!d || !d.slug) continue;
    const slug = d.slug.toLowerCase();
    const cand = { zh: d.zh, en: d.en, es: d.es, ar: d.ar };
    const good = !validateCopyPurity(cand);
    const ex = drafts.get(slug);
    if (!ex || (good && !ex.good)) drafts.set(slug, { o: cand, good }); // 空槽或用合格替换不合格
  }
}
console.log(`读入 ${files} 个批文件, 去重后草稿 ${drafts.size} 条`);

// 2) 校验
const valid = new Map(), invalid = [];
for (const [slug, { o }] of drafts) {
  const bad = validateCopyPurity(o);
  if (bad) invalid.push({ slug, reason: bad });
  else valid.set(slug, { zh: o.zh.trim(), en: o.en.trim(), es: o.es.trim(), ar: o.ar.trim() });
}
console.log(`校验: 通过 ${valid.size}, 不合格 ${invalid.length}`);
if (invalid.length) console.log("  不合格样例:", invalid.slice(0, 8).map((x) => `${x.slug}(${x.reason})`).join(", "));

// 3) 写库
const config = (await import("../src/payload.config.ts")).default;
let payload;
for (let a = 1; ; a++) {
  try { payload = await getPayload({ config }); break; }
  catch (e) { if (a >= 6) throw e; console.log(`  连接DB失败(${a}/6): ${e.message}, 5s后重试`); await new Promise((r) => setTimeout(r, 5000)); }
}
// pg 连接被休眠/网络掐断时, 空闲客户端会 emit 'error'; 无监听则进程崩溃 → 兜住, 让重试逻辑接管。
// 但吞掉≠没发生：计数并在收尾以非零码退出，避免"看起来全成功"。
let uncaught = 0;
process.on("uncaughtException", (e) => { uncaught++; console.error("WARN uncaught:", e.message); });
process.on("unhandledRejection", (e) => { uncaught++; console.error("WARN rejection:", e?.message || e); });
const withTimeout = (p, ms, l) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error(`超时 ${l}`)), ms))]);
// 瞬时 DB 断开后 pg 池会按需重连; 重试退避即可恢复
const withRetry = async (fn, label, tries = 5) => {
  let last;
  for (let a = 1; a <= tries; a++) {
    try { return await fn(); }
    catch (e) { last = e; if (a < tries) { console.log(`  重试 ${label}(${a}/${tries}): ${e.message}`); await new Promise((r) => setTimeout(r, 2000 * a)); } }
  }
  throw last;
};

const stats = { updated: 0, skipExist: 0, notFound: 0, failed: 0 };
const report = [];
let i = 0;
for (const [slug, desc] of valid) {
  i++;
  try {
    const res = await withRetry(() => withTimeout(payload.find({ collection: "products", where: { slug: { equals: slug } }, locale: "all", depth: 0, limit: 1, overrideAccess: true }), 30000, `find ${slug}`), `find ${slug}`);
    const p = res.docs[0];
    if (!p) { stats.notFound++; report.push({ slug, status: "not_found" }); continue; }
    if (!OVERWRITE && hasAnyLocalizedDescription(p.description)) { stats.skipExist++; continue; }
    if (APPLY) {
      for (const l of PRODUCT_COPY_LOCALES) {
        await withRetry(() => withTimeout(payload.update({ collection: "products", id: p.id, locale: l, data: { description: desc[l] }, overrideAccess: true }), 60000, `update ${slug}/${l}`), `update ${slug}/${l}`);
      }
    }
    stats.updated++;
    report.push({ slug, status: APPLY ? "updated" : "would_update" });
  } catch (e) {
    stats.failed++;
    report.push({ slug, status: "failed", error: e.message });
    console.log(`  ✗ ${slug}: ${e.message}`);
  }
  if (i % 100 === 0 || i === valid.size) console.log(`  进度 ${i}/${valid.size} | 写${stats.updated} 跳已有${stats.skipExist} 未找到${stats.notFound} 失败${stats.failed}`);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ mode: APPLY ? "apply" : "dry-run", files, drafts: drafts.size, valid: valid.size, invalid, stats, report }, null, 2));
console.log(`\n${APPLY ? "✅ APPLY" : "🔍 DRY-RUN"} 完成: 写库 ${stats.updated}, 跳过已有 ${stats.skipExist}, 未找到 ${stats.notFound}, 失败 ${stats.failed}`);
console.log(`报告 → ${OUT}`);
process.exit(stats.failed || uncaught ? 1 : 0);
