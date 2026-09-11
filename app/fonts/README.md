# Segoe

`segoe-regular.woff2` — the application typeface, used for all UI text.
Code keeps JetBrains Mono.

## Provenance and licence

Downloaded from onlinewebfonts.com. The copyright string embedded in the file
reads, verbatim:

> Digitized data (c) 1997-2003 Agfa Monotype Corporation. All rights reserved.
> Segoe is a trademark of The Monotype Corporation.

This is a Monotype typeface. A web licence for it comes from Monotype, and
onlinewebfonts is not in a position to grant one. Redistributing and embedding
it here was a deliberate decision taken with that known; it is recorded so
nobody later assumes the font was cleared.

Swapping it out touches one line: the `src` in `app/layout.js`. Nothing else in
the codebase names the file.

The zero-risk alternative, if this ever needs to change: a `"Segoe UI"` local
font stack renders the real thing on Windows at no download cost, with
[Selawik](https://github.com/microsoft/Selawik) — Microsoft's own open-source,
metric-compatible substitute — covering everything else. Selawik also ships
real Semibold and Bold cuts.

## Known limitation

Regular only. No bold, no italic, 249 glyphs. Every `font-semibold` and
`font-bold` in the app is synthesised by the browser rather than drawn by the
designer.
