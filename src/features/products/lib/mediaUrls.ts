const RETIRED_PAYLOAD_MEDIA_FILE_PREFIX = "/api/media/file/";

export function isRetiredPayloadMediaFileUrl(url: string): boolean {
  if (url.startsWith(RETIRED_PAYLOAD_MEDIA_FILE_PREFIX)) {
    return true;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false;
  }

  try {
    return new URL(url).pathname.startsWith(RETIRED_PAYLOAD_MEDIA_FILE_PREFIX);
  } catch {
    return false;
  }
}

export function isUsableMediaUrl(
  url: string | null | undefined
): url is string {
  return typeof url === "string" && url.length > 0 && !isRetiredPayloadMediaFileUrl(url);
}
