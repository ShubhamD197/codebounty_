# Mayoze

`mayoze-regular.woff2` — the display face used for the CodeBounty wordmark,
headings, and page titles.

- Copyright embedded in the font file: `Mayoze © salamahtype. 2024. All Rights
  Reserved.`
- Obtained from onlinewebfonts.com, whose bundled licence text asks for
  attribution and also warns that "some fonts provided are trial versions of
  full versions and may not allow embedding unless a commercial license is
  purchased".

Those two statements do not agree. Before this ships anywhere commercial,
confirm the licence with the foundry (salamahtype). If it turns out not to be
licensed for web embedding, the only change needed is the `src` in
`app/layout.js` — nothing else references the file.

Only a Regular weight exists. There is no bold or italic cut, so anything
heavier is synthesised by the browser.
