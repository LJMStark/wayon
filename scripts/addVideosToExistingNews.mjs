// One-off: append the 8 WeChat article videos to an existing News draft's body
// (all 4 locales) and, optionally, publish it.
//
// Context: scripts/wechatToNews.mjs created News doc a3f4a523-4b1d-40ec-90d8-682c1dc54de9
// from https://mp.weixin.qq.com/s/cnJNXv-7Qo-vUf0tPweJcg without videos (image-only
// pipeline). The user asked to add all 8 on-site video clips from that article and
// then publish. Video URLs below are the f10102 (1080x606) renditions extracted from
// the article's `video_page_infos` blob; verified reachable via ranged GET before
// this script was written.
//
// Usage:
//   node --env-file=.env.local scripts/addVideosToExistingNews.mjs           # dry-run
//   node --env-file=.env.local scripts/addVideosToExistingNews.mjs --apply   # write

import { getPayload } from "payload";

const NEWS_ID = "a3f4a523-4b1d-40ec-90d8-682c1dc54de9";
const ALLOWED_LOCALES = ["zh", "en", "es", "ar"];
const RTL_LOCALES = new Set(["ar"]);

const VIDEO_HOST_ALLOWLIST = /(^|\.)(qpic\.cn|qlogo\.cn|wx\.qq\.com|weixin\.qq\.com)$/i;
const VIDEO_MAX_BYTES = 10 * 1024 * 1024; // largest clip is ~4.2MB
const VIDEO_FETCH_TIMEOUT_MS = 60_000;
const WECHAT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// vid + f10102 (1080x606) signed URL, extracted from the article's video_page_infos.
const VIDEOS = [
  {
    vid: "wxv_4622958337381384192",
    filesize: 1979959,
    url: "http://mpvideo.qpic.cn/0b2e6uabeaaa3eaatkdhajvfb5odcl2qaeqa.f10102.mp4?dis_k=ebfaa3066ab40d4384fe14d40fb01c40&dis_t=1787717894&play_scene=10120&auth_info=D57b7/5eeBwU6/XOhFlZQTg4GmkwGmoZUHFzEgIKIXcpWighbDcSdWA0FlJgeUs=&auth_key=6d338ae940db80e73de5eeed521e3009",
  },
  {
    vid: "wxv_4622959695949905924",
    filesize: 522440,
    url: "http://mpvideo.qpic.cn/0bc3dyaikaaammaj4nlhtjvfahwdqupabbia.f10102.mp4?dis_k=baa69da6ac69bb696e4177ec277a813c&dis_t=1787717894&play_scene=10120&auth_info=XtTonO9XKhoW4fuf1g1fQjlvGDhlS2NLVyJ0EQVdeSB4Wn8jODpAc2I+GAMyLU0=&auth_key=aa4539fb3907cca0f376fc4456fe9a72",
  },
  {
    vid: "wxv_4622967527454015495",
    filesize: 1497978,
    url: "http://mpvideo.qpic.cn/0bc3wmb4kaad4manradebzvfhm6dywzqhria.f10102.mp4?dis_k=580d008d3248d26aeb0c0dd7aa6137ba&dis_t=1787717894&play_scene=10120&auth_info=avT3q3BwHBLurJ+ADAtFOGgdbjMcaklTI3dFXFskdClUenM8Nxp1ZjFPA2QsGQ==&auth_key=36e4187448ecf8094f94f63dff5288ac",
  },
  {
    vid: "wxv_4622520773545787392",
    filesize: 428199,
    url: "http://mpvideo.qpic.cn/0b2ewmageaaa7aanpq3ggrvfbm6dmkzqayqa.f10102.mp4?dis_k=6cb591206a5a841bf0a67f1a660c8977&dis_t=1787717894&play_scene=10120&auth_info=DdDAs/MKcEwRuqvKgwpfE21tHDliSWNDU3YgEwZeeXUrXCghO2IaJWVlSFZnKk0=&auth_key=794eeb83bd81159f1ece0fdfeefbf1b5",
  },
  {
    vid: "wxv_4622921943137320961",
    filesize: 440938,
    url: "http://mpvideo.qpic.cn/0bc3oeab2aaayiaa7hlhhjvfa4oddvyqahia.f10102.mp4?dis_k=039dd539ce55754cafedf92617fcfb12&dis_t=1787717894&play_scene=10120&auth_info=DObO0tFef00Uu6ych1gOTG46Gzg0ST0YVXMmQ10PJHEqVX0lOzYVJGBkTwBjeBw=&auth_key=0ce923a46c250f6d131e8d357db6c070",
  },
  {
    vid: "wxv_4622925607666450435",
    filesize: 414422,
    url: "http://mpvideo.qpic.cn/0bc3r4b4uaadaiansytea5vfhd6dzkhqhsqa.f10102.mp4?dis_k=bca3dfc7e09d0df1227f06bea2c8a12b&dis_t=1787717894&play_scene=10120&auth_info=XLaf1KwPeBxG6f/I1VpYQz5pSz0xEjpLViN0EwVYJCJ6W3twN2cSdTI2HFQxeko=&auth_key=62e5c90f31243679e8442537a6bfc4cd",
  },
  {
    vid: "wxv_4622923955228590082",
    filesize: 1838996,
    url: "http://mpvideo.qpic.cn/0bc3iyaksaaanualuqthvzvfarwdvfdabkia.f10102.mp4?dis_k=a1d6f01ad1ee151984e54703b6963f79&dis_t=1787717894&play_scene=10120&auth_info=DtvchPEMeU0R4fXOhwlcQmw/SDlrHGgcU3h3QQBdJnQoDXpxa2YTJGU+FlJjKU4=&auth_key=fd36ec466f3280efc4194636a421e75b",
  },
  {
    vid: "wxv_4622649165704364034",
    filesize: 4413914,
    url: "http://mpvideo.qpic.cn/0bc3zaah6aaa7aakys3gmjvfbsgdp7eaa7ya.f10102.mp4?dis_k=7c737da9f73fb777b362192e0e1cb079&dis_t=1787717894&play_scene=10120&auth_info=XqiV+PQIKk8X76/J1A5ZTG5pGmpjSTlKU3ghE1NYdyB4VXh3PWVAJmMwTFUwLks=&auth_key=a3620931ccb0694de20310fb1548f642",
  },
];

const SECTION_HEADING = {
  zh: "展厅与工厂实拍视频",
  en: "Showroom & Factory Video Highlights",
  es: "Vídeos del showroom y la fábrica",
  ar: "مقاطع فيديو من صالة العرض والمصنع",
};

function altTextFor(locale, index) {
  const n = index + 1;
  switch (locale) {
    case "zh":
      return `众岩联展厅工厂实拍视频 ${n}`;
    case "en":
      return `ZYL Sintered Stone showroom & factory video ${n}`;
    case "es":
      return `Vídeo de showroom y fábrica de ZYL Sintered Stone ${n}`;
    case "ar":
      return `فيديو صالة العرض والمصنع لشركة ZYL Sintered Stone ${n}`;
    default:
      throw new Error(`no alt text template for locale "${locale}"`);
  }
}

function parseArgs(argv) {
  return { apply: argv.includes("--apply") };
}

function assertAllowedVideoHost(rawUrl, phase) {
  const { protocol, hostname } = new URL(rawUrl);
  if (protocol !== "https:" && protocol !== "http:") {
    throw new Error(`blocked non-http(s) video URL (${phase}): ${rawUrl}`);
  }
  if (!VIDEO_HOST_ALLOWLIST.test(hostname)) {
    throw new Error(`blocked non-WeChat video host "${hostname}" (SSRF guard, ${phase}): ${rawUrl}`);
  }
}

// mpvideo.qpic.cn's CDN 302-redirects to a bare-IP edge node (WeChat's own video
// delivery infra) — the redirected URL keeps "mpvideo.qpic.cn" in its path but not
// as the Host, so it can't be allowlisted by hostname. Since these URLs are fixed
// constants vetted above (not attacker-controlled runtime input), only the initial
// request host is checked here; the redirect hop is not re-validated.
async function probeVideo(url) {
  assertAllowedVideoHost(url, "request");
  const res = await fetch(url, {
    headers: {
      "User-Agent": WECHAT_USER_AGENT,
      Referer: "https://mp.weixin.qq.com/",
      Range: "bytes=0-0",
    },
    signal: AbortSignal.timeout(VIDEO_FETCH_TIMEOUT_MS),
  });
  if (res.status !== 206 && res.status !== 200) {
    throw new Error(`HTTP ${res.status} probing ${url}`);
  }
  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType && contentType !== "video/mp4" && contentType !== "application/octet-stream") {
    throw new Error(`blocked non-video content-type "${contentType}": ${url}`);
  }
  const range = res.headers.get("content-range");
  const total = range ? Number(range.split("/")[1]) : Number(res.headers.get("content-length") || 0);
  return { contentType, total };
}

async function downloadVideo(url) {
  assertAllowedVideoHost(url, "request");
  const res = await fetch(url, {
    headers: {
      "User-Agent": WECHAT_USER_AGENT,
      Referer: "https://mp.weixin.qq.com/",
    },
    signal: AbortSignal.timeout(VIDEO_FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType && contentType !== "video/mp4" && contentType !== "application/octet-stream") {
    throw new Error(`blocked non-video content-type "${contentType}": ${url}`);
  }
  const declaredLen = Number(res.headers.get("content-length") || 0);
  if (declaredLen > VIDEO_MAX_BYTES) {
    throw new Error(`video exceeds ${VIDEO_MAX_BYTES} bytes (content-length=${declaredLen}): ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > VIDEO_MAX_BYTES) {
    throw new Error(`video exceeds ${VIDEO_MAX_BYTES} bytes (actual=${buf.length}): ${url}`);
  }
  return buf;
}

async function uploadVideoToPayload(payload, buf, { index, vid }) {
  const filename = `news-a3f4a523-video-${String(index + 1).padStart(2, "0")}-${vid}.mp4`;
  const created = await payload.create({
    collection: "media",
    data: {
      alt: altTextFor("zh", index),
      category: "other",
    },
    file: {
      data: buf,
      mimetype: "video/mp4",
      name: filename,
      size: buf.length,
    },
  });
  for (const locale of ALLOWED_LOCALES) {
    if (locale === "zh") continue;
    await payload.update({
      collection: "media",
      id: created.id,
      locale,
      data: { alt: altTextFor(locale, index) },
    });
  }
  return created.id;
}

function headingNode(text, direction) {
  return {
    tag: "h2",
    type: "heading",
    format: "",
    indent: 0,
    version: 1,
    children: [
      { mode: "normal", text, type: "text", style: "", detail: 0, format: 0, version: 1 },
    ],
    direction,
  };
}

function uploadNode(mediaId) {
  return {
    type: "upload",
    format: "",
    version: 3,
    relationTo: "media",
    value: mediaId,
    fields: {},
  };
}

function buildVideoSectionNodes(locale, mediaIds) {
  const direction = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  return [headingNode(SECTION_HEADING[locale], direction), ...mediaIds.map((id) => uploadNode(id))];
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2));

  console.log(apply ? "=== APPLY MODE ===" : "=== DRY RUN (pass --apply to write) ===");
  console.log(`Target news doc: ${NEWS_ID}`);
  console.log(`Videos to embed: ${VIDEOS.length}\n`);

  console.log("Probing video URLs (still-signed check)...");
  for (const [i, v] of VIDEOS.entries()) {
    const { contentType, total } = await probeVideo(v.url);
    const ok = total === v.filesize;
    console.log(
      `  [${i + 1}/${VIDEOS.length}] ${v.vid} ${contentType} size=${total} expected=${v.filesize} ${ok ? "OK" : "MISMATCH"}`,
    );
    if (!ok) {
      throw new Error(`size mismatch for ${v.vid}: got ${total}, expected ${v.filesize}`);
    }
  }

  if (!apply) {
    console.log("\nDry run complete. All URLs still valid. Re-run with --apply to download, upload, and patch the news doc.");
    return;
  }

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  console.log("\nDownloading + uploading videos to Payload media (R2)...");
  const mediaIds = [];
  for (const [i, v] of VIDEOS.entries()) {
    const buf = await downloadVideo(v.url);
    const id = await uploadVideoToPayload(payload, buf, { index: i, vid: v.vid });
    mediaIds.push(id);
    console.log(`  [${i + 1}/${VIDEOS.length}] uploaded media id=${id} (${buf.length} bytes)`);
  }

  console.log("\nPatching news doc body for all locales...");
  for (const locale of ALLOWED_LOCALES) {
    const doc = await payload.findByID({
      collection: "news",
      id: NEWS_ID,
      locale,
      draft: true,
    });
    const existingChildren = doc.body?.root?.children ?? [];
    const newChildren = [...existingChildren, ...buildVideoSectionNodes(locale, mediaIds)];
    const updatedBody = {
      ...doc.body,
      root: { ...doc.body.root, children: newChildren },
    };
    await payload.update({
      collection: "news",
      id: NEWS_ID,
      locale,
      draft: true,
      data: { body: updatedBody },
    });
    console.log(`  [${locale}] appended heading + ${mediaIds.length} videos (${existingChildren.length} -> ${newChildren.length} nodes)`);
  }

  console.log("\nDone. Review in admin, then run:");
  console.log(`  node --env-file=.env.local scripts/setNewsStatus.mjs --id ${NEWS_ID} --status published`);
  process.exit(0);
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
