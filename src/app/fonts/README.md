# Font Notice

Runtime fonts are vendored in this directory and loaded through `next/font/local`.
CSS font stacks intentionally avoid system fallback font names, so pages do not
depend on fonts installed on the visitor's device.

## Fonts

- `NotoSansSC-WayonSubset.woff2`: primary UI font for Chinese and Latin interface text (subset of Noto Sans SC, regular + bold weights only).
- `GeourceSansCHS-Regular-WayonSubset.woff2`, `GeourceSansCHS-Medium-WayonSubset.woff2`, `GeourceSansCHS-Bold-WayonSubset.woff2`: YuanGou / Geource Sans subsets for the home hero.
- `PlayfairDisplay.ttf`: editorial heading font.
- `LXGWMarkerGothic-Regular-WayonSubset.woff2`: Chinese display heading font subset.
- `Cairo.ttf`: Arabic UI font.

## Licenses

All active runtime fonts are covered by SIL Open Font License 1.1 notices stored
under `licenses/`.
