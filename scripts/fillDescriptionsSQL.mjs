#!/usr/bin/env node
/**
 * 直连 Postgres 批量回填 description(本地化文本)，绕开 Payload 逐条 update 的 hook/重验证开销。
 * 仅填「当前为空」的 locale 行(description IS NULL OR '')，不覆盖已有 → 幂等、可重复跑。
 * description 是普通本地化文本字段，无需 pinyin/压缩 hook，直写安全。
 * 语义注意：本脚本「逐 locale 只填空行」（zh-only 产品也能补齐其余语言）；
 * 与 applyHaikuDrafts.mjs（任一 locale 已有描述即整体跳过）语义不同，按需选用。
 * 用法:
 *   node --env-file=.env.local scripts/fillDescriptionsSQL.mjs            # dry-run(只统计)
 *   node --env-file=.env.local scripts/fillDescriptionsSQL.mjs --apply
 *   ...flags: --dir=/tmp/hb-out
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { validateCopyPurity } from "../src/features/products/lib/copyPurity.ts";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const DIR = (args.find((a) => a.startsWith("--dir=")) || "").split("=")[1] || "/tmp/hb-out";
const LOCALES = ["zh", "en", "es", "ar"];
const CHUNK = 500;

// 纯净度校验共享自 src/features/products/lib/copyPurity.ts（与 applyHaikuDrafts.mjs 同源）

// 1) 汇总草稿(合格版本优先, 坏副本不覆盖)
const drafts = new Map();
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
    if (!ex || (good && !ex.good)) drafts.set(slug, { o: cand, good });
  }
}
const valid = new Map();
let invalid = 0;
for (const [slug, { o }] of drafts) {
  if (validateCopyPurity(o)) { invalid++; continue; }
  valid.set(slug, { zh: o.zh.trim(), en: o.en.trim(), es: o.es.trim(), ar: o.ar.trim() });
}
console.log(`读入 ${files} 批文件 | 合格草稿 ${valid.size} | 不合格 ${invalid}`);

// 2) 连接 + slug→uuid
const uri = process.env.DATABASE_URI || process.env.DATABASE_URL || process.env.POSTGRES_URL;
const client = new pg.Client({ connectionString: uri });
await client.connect();

const slugs = [...valid.keys()];
const idRows = (await client.query(`SELECT id, slug FROM products WHERE lower(slug) = ANY($1)`, [slugs])).rows;
const slug2id = new Map(idRows.map((r) => [r.slug.toLowerCase(), r.id]));
const notFound = slugs.filter((s) => !slug2id.has(s));
console.log(`产品匹配: ${slug2id.size}/${slugs.length} | 未找到 ${notFound.length}${notFound.length ? " " + JSON.stringify(notFound.slice(0, 10)) : ""}`);

// 3) 逐 locale 批量 UPDATE(仅空行)
const stats = { byLocale: {}, total: 0 };
for (const loc of LOCALES) {
  const pairs = [];
  for (const [slug, desc] of valid) {
    const id = slug2id.get(slug);
    if (id) pairs.push([id, desc[loc]]);
  }
  let updated = 0;
  for (let i = 0; i < pairs.length; i += CHUNK) {
    const chunk = pairs.slice(i, i + CHUNK);
    const valuesSql = chunk.map((_, k) => `($${k * 2 + 1}::uuid, $${k * 2 + 2}::text)`).join(",");
    const params = [...chunk.flatMap(([id, d]) => [id, d]), loc];
    const sql = `UPDATE products_locales pl SET description = v.d
      FROM (VALUES ${valuesSql}) AS v(pid, d)
      WHERE pl._parent_id = v.pid AND pl._locale = $${chunk.length * 2 + 1} AND (pl.description IS NULL OR pl.description = '')`;
    if (APPLY) { const res = await client.query(sql, params); updated += res.rowCount; }
  }
  stats.byLocale[loc] = updated;
  stats.total += updated;
  console.log(`  ${loc}: ${APPLY ? "更新 " + updated + " 行" : "待更新(干跑不执行)"} / 候选 ${pairs.length}`);
}

// 4) 复核: 这些产品仍为空的 locale 行数
const ids = [...slug2id.values()];
const remain = (await client.query(
  `SELECT _locale, count(*)::int AS n FROM products_locales
   WHERE _parent_id = ANY($1) AND (description IS NULL OR description = '') GROUP BY _locale ORDER BY _locale`,
  [ids]
)).rows;
console.log("复核(目标产品仍空的 locale 行):", remain.length ? remain.map((r) => `${r._locale}:${r.n}`).join(" ") : "(全部已填)");

await client.end();
console.log(`\n${APPLY ? "✅ APPLY" : "🔍 DRY-RUN"} 完成: 本次共更新 ${stats.total} 个 locale 行`);
process.exit(0);
