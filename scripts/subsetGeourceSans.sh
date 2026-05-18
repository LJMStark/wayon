#!/usr/bin/env bash
# Subset GeourceSans CHS TTF -> GB2312 woff2 used by src/app/fonts/.
#
# When to run: only if you want to regenerate the subset (e.g. switching to
# a wider charset, or a new GeourceSans release). The committed woff2 files
# already cover the GB2312 character set (6763 CJK + ASCII + punctuation),
# which is sufficient for any non-rare-character product/news/category names.
#
# Prerequisites:
#   pip3 install --break-system-packages fonttools brotli
#
# Usage:
#   1. Download GeourceSans-TTF-CHS.zip from
#      https://github.com/howlingFounts/GeourceSans/releases
#   2. Unzip it somewhere (e.g. /tmp/geource/chs/)
#   3. Run:    bash scripts/subsetGeourceSans.sh /tmp/geource/chs
#
# The script writes:
#   src/app/fonts/GeourceSansCHS-Regular-Subset.woff2
#   src/app/fonts/GeourceSansCHS-Medium-Subset.woff2
#   src/app/fonts/GeourceSansCHS-Bold-Subset.woff2

set -euo pipefail

SRC_DIR="${1:?usage: subsetGeourceSans.sh <dir-with-GeourceSansCHS-{Regular,Medium,Bold}.ttf>}"
CHARSET="$(dirname "$0")/fonts/gb2312.txt"
OUT_DIR="$(dirname "$0")/../src/app/fonts"

if ! command -v pyftsubset >/dev/null 2>&1; then
  echo "pyftsubset not found. Install with: pip3 install --break-system-packages fonttools brotli" >&2
  exit 1
fi

for weight in Regular Medium Bold; do
  src="$SRC_DIR/GeourceSansCHS-$weight.ttf"
  out="$OUT_DIR/GeourceSansCHS-$weight-Subset.woff2"
  if [[ ! -f "$src" ]]; then
    echo "missing source: $src" >&2
    exit 1
  fi
  echo "subsetting $weight ..."
  pyftsubset "$src" \
    --text-file="$CHARSET" \
    --output-file="$out" \
    --flavor=woff2 \
    --layout-features='*' \
    --no-hinting \
    --desubroutinize \
    --notdef-outline \
    --recommended-glyphs
  printf '  -> %s (%s bytes)\n' "$out" "$(wc -c <"$out" | tr -d ' ')"
done

echo "done."
