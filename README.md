# gta6-meme-x-01 — v1: Leonida DMV Driver License Renewal

A fake official document meme for the make.fun bounty
"Post a GTA 6 meme on X" ($500, top 50 paid).

## The joke

Your driver licence expired during the 13-year wait for GTA VI.
The Leonida DMV renews it — new expiry date: the day GTA VI launches.
Renewal fee waived, paid in patience since 2013. You are #4,811 in line.

The make.fun ghost is the DMV clerk: it stamps the form APPROVED,
holds up its magenta star coin, and "make.fun" is the issuing
authority's seal on the document.

## How to run

Node 22 only:

```sh
mkdir -p out
MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out \
  ~/.node22/node-v22.23.4-linux-x64/bin/node main.ts
```

`main.ts` (stdlib only: `node:fs`, `node:path`, `node:zlib`) deterministically
renders the meme to `out/meme.png` (1024x1024) and copies `POST.json`
alongside it. No network, no clock, no files outside the repo — two runs
produce byte-identical output. The PNG is rendered from scratch in code:
a minimal PNG encoder (RGBA raster + zlib deflate) and a hand-typed 5x7
bitmap font, so the document text is genuinely readable.

`meme.png` in the repo root is the rendered meme — the first picture of
the X post.

## X post

The post text is prepared by the parent run (link to the bounty,
@makefunai, and the play code). Posting is the user's job, from @BOSantai.
`POST.json` is a placeholder until the post exists — do not invent a URL.
