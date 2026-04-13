#!/usr/bin/env python3
"""
Replace all non-universal media files with yellow placeholder images/video.

Keeps original dimensions. Adds filename text centered on the yellow background
so you can tell which placeholder goes where.

Skipped directories (universal assets):
  - brand/       (company logos)
  - icons/       (social platform icons)
  - backgrounds/ (decorative textures)
  - footer/      (generic footer icons)
"""

import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
YELLOW = (255, 210, 50)
TEXT_COLOR = (80, 60, 0)

SKIP_DIRS = {"brand", "icons", "backgrounds", "footer"}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov"}


def get_font(size: int):
    """Try to load a readable font, fall back to default."""
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def create_placeholder_image(width: int, height: int, label: str, out_path: str):
    """Generate a yellow placeholder image with centered label text."""
    img = Image.new("RGB", (width, height), YELLOW)
    draw = ImageDraw.Draw(img)

    # Scale font to fit reasonably
    font_size = max(12, min(width, height) // 12)
    font = get_font(font_size)

    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (width - tw) // 2
    y = (height - th) // 2
    draw.text((x, y), label, fill=TEXT_COLOR, font=font)

    ext = os.path.splitext(out_path)[1].lower()
    if ext == ".webp":
        img.save(out_path, "WEBP", quality=85)
    elif ext == ".png":
        img.save(out_path, "PNG")
    else:
        img = img.convert("RGB")
        img.save(out_path, "JPEG", quality=90)


def get_image_size(path: str):
    """Read original image dimensions."""
    try:
        with Image.open(path) as im:
            return im.size  # (width, height)
    except Exception as e:
        print(f"  WARN: cannot read {path}: {e}")
        return None


def get_video_size(path: str):
    """Read video dimensions via ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=s=x:p=0",
                path,
            ],
            capture_output=True, text=True, timeout=10,
        )
        parts = result.stdout.strip().split("x")
        if len(parts) == 2:
            return int(parts[0]), int(parts[1])
    except Exception as e:
        print(f"  WARN: cannot probe video {path}: {e}")
    return None


def create_placeholder_video(width: int, height: int, label: str, out_path: str):
    """Generate a short yellow placeholder video with centered label."""
    # First create a placeholder image frame
    frame_path = out_path + ".frame.png"
    create_placeholder_image(width, height, label, frame_path)

    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-loop", "1",
                "-i", frame_path,
                "-c:v", "libx264",
                "-t", "3",
                "-pix_fmt", "yuv420p",
                "-vf", f"scale={width}:{height}",
                out_path,
            ],
            capture_output=True, timeout=30,
        )
    finally:
        if os.path.exists(frame_path):
            os.remove(frame_path)


def main():
    replaced_images = 0
    replaced_videos = 0
    skipped = 0
    errors = 0

    for dirpath, dirnames, filenames in os.walk(ASSETS_DIR):
        # Check if this directory should be skipped
        rel = os.path.relpath(dirpath, ASSETS_DIR)
        top_dir = rel.split(os.sep)[0]
        if top_dir in SKIP_DIRS:
            skipped += len(filenames)
            continue

        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            ext = os.path.splitext(fname)[1].lower()
            # Use relative path from assets/ as label
            label = os.path.relpath(fpath, ASSETS_DIR)

            if ext in IMAGE_EXTS:
                size = get_image_size(fpath)
                if size is None:
                    errors += 1
                    continue
                w, h = size
                print(f"  IMG  {label}  ({w}x{h})")
                create_placeholder_image(w, h, label, fpath)
                replaced_images += 1

            elif ext in VIDEO_EXTS:
                size = get_video_size(fpath)
                if size is None:
                    errors += 1
                    continue
                w, h = size
                print(f"  VID  {label}  ({w}x{h})")
                create_placeholder_video(w, h, label, fpath)
                replaced_videos += 1

    print()
    print(f"Done! Replaced {replaced_images} images + {replaced_videos} videos.")
    print(f"Skipped {skipped} files (universal assets).")
    if errors:
        print(f"Errors: {errors}")


if __name__ == "__main__":
    main()
