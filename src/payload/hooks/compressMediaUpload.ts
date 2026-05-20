import type { CollectionBeforeOperationHook } from "payload";
import sharp from "sharp";

// Bound the stored original for admin uploads before Payload generates its
// size variants (thumbnail/card/feature). Existing catalog images were already
// compressed offline (~200KB, ~2000px); this protects against a future admin
// uploading a multi-MB phone photo straight into the media library.
//
// Runs in beforeOperation so the compressed buffer is what Payload both stores
// as the original AND derives the size variants from. Non-raster uploads
// (mp4, pdf) are passed through untouched.

const COMPRESSIBLE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_EDGE = 2400;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
// Block genuinely pathological images (decompression bombs) while still
// accepting any real camera upload (~50MP DSLR). sharp throws past this limit;
// the catch keeps the original so the upload still succeeds, just uncompressed.
const MAX_INPUT_PIXELS = 8192 * 8192; // ~67 MP

export const compressMediaUpload: CollectionBeforeOperationHook = async ({
  operation,
  req,
}) => {
  // beforeOperation only ever sees "create" or "update" — Payload routes
  // update-by-id through the "update" operation. Both can carry a new file.
  if (operation !== "create" && operation !== "update") {
    return;
  }

  const file = req.file;
  if (!file || !COMPRESSIBLE_MIME_TYPES.has(file.mimetype)) {
    return;
  }

  try {
    const input = sharp(file.data, {
      limitInputPixels: MAX_INPUT_PIXELS,
    }).rotate(); // honor EXIF orientation
    const metadata = await input.metadata();
    const oversized =
      (metadata.width ?? 0) > MAX_EDGE || (metadata.height ?? 0) > MAX_EDGE;
    const pipeline = oversized
      ? input.resize(MAX_EDGE, MAX_EDGE, {
          fit: "inside",
          withoutEnlargement: true,
        })
      : input;

    // Re-encode in the same format to avoid filename/extension/content-type
    // drift (Payload keeps the uploaded extension).
    let output: Buffer;
    switch (file.mimetype) {
      case "image/png":
        output = await pipeline
          .png({ compressionLevel: 9, effort: 7 })
          .toBuffer();
        break;
      case "image/webp":
        output = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
        break;
      default:
        output = await pipeline
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer();
    }

    // Keep the original when recompression didn't help and no resize happened
    // (the source was already well-optimized).
    if (!oversized && output.length >= file.data.length) {
      return;
    }

    req.file = { ...file, data: output, size: output.length };

    req.payload.logger.info(
      `compressMediaUpload: "${file.name}" ${file.data.length} → ${output.length} bytes`
    );
  } catch (error) {
    // Never block an upload on a compression failure — store the original.
    req.payload.logger.error(
      `compressMediaUpload failed for "${file.name}", keeping original: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
