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

export function getTradeMediaContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".heic":
      return "image/heic";
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}
