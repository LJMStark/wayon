import path from "node:path";

export const TRADE_MEDIA_ROUTE_PREFIX = "/api/trade-media";

export function buildTradeMediaPublicUrl(sourcePath: string): string {
  const segments = sourcePath
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  return `${TRADE_MEDIA_ROUTE_PREFIX}/${segments.join("/")}`;
}

function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

export function resolveTradeMediaPath(
  rootDir: string,
  segments: string[]
): string | null {
  if (segments.length === 0) {
    return null;
  }

  const decodedSegments = segments
    .map(decodeSegment)
    .filter((segment): segment is string => segment !== null)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (decodedSegments.length !== segments.length) {
    return null;
  }

  if (
    decodedSegments.some(
      (segment) =>
        segment.includes("\0") ||
        segment === "." ||
        segment === ".." ||
        path.isAbsolute(segment) ||
        segment.split(/[\\/]/).some((part) => part === "..")
    )
  ) {
    return null;
  }

  const absoluteRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(absoluteRoot, ...decodedSegments);

  if (
    resolvedPath !== absoluteRoot &&
    !resolvedPath.startsWith(`${absoluteRoot}${path.sep}`)
  ) {
    return null;
  }

  return resolvedPath;
}

// Whitelist of file extensions that the trade-media route is allowed to serve.
// Anything outside this list returns null — callers MUST treat null as
// "do not serve". Keep the list as a single source of truth so the HTTP
// route, the page-side video element, and any future consumer agree on
// what counts as a "trade media" file. Hidden files (.DS_Store, Thumbs.db)
// and arbitrary office documents fall through to null and get rejected.
const TRADE_MEDIA_CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

export function getTradeMediaContentType(filePath: string): string | null {
  const extension = path.extname(filePath).toLowerCase();
  return TRADE_MEDIA_CONTENT_TYPES[extension] ?? null;
}
