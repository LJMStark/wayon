# Font Notice

Runtime fonts are vendored in this directory and loaded through `next/font/local`,
plus Inter pulled by `next/font/google` for extended-Latin coverage. CSS font
stacks for the primary UI flow do not depend on user-installed fonts; the
Arabic fallback chain explicitly names well-known system Arabic fonts (Segoe
UI Arabic / Noto Naskh Arabic) so a Cairo download failure still renders a
coherent script.

## Fonts

- `NotoSansSC-WayonSubset.woff2`: primary UI font for Chinese and basic Latin (subset of Noto Sans SC, regular + bold).
- `GeourceSansCHS-Regular-WayonSubset.woff2`, `GeourceSansCHS-Medium-WayonSubset.woff2`, `GeourceSansCHS-Bold-WayonSubset.woff2`: YuanGou / Geource Sans subsets (GB2312, ~1MB each) for CJK headings and the home hero.
- `PlayfairDisplay.ttf`: editorial Latin heading font.
- `Cairo.woff2`: Arabic UI font (variable, weight 200–1000).
- Inter (loaded via `next/font/google`): extended-Latin body fallback for `en` / `es` glyphs outside the NotoSansSC subset.

## Licenses

All active runtime fonts are covered by SIL Open Font License 1.1 notices stored
under `licenses/`.
