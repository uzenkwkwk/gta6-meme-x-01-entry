// gta6-meme-x-01 v1 — Leonida DMV Driver License Renewal notice meme.
// Deterministic PNG renderer. Node 22, stdlib only (node:fs, node:path, node:zlib).
// No network, no wall clock, no files outside the repo. Two runs are byte-identical.
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------------------
// 5x7 bitmap font, typed in-session. Uppercase + digits + punctuation only;
// all document text is set in caps, as a real DMV form would be.
// Each glyph is 7 rows of 5 cells; "#" = ink, "." = blank.
// ---------------------------------------------------------------------------
const FONT: Record<string, string[]> = {
  "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  "C": [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  "G": [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  "J": ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "...#.", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  ";": [".....", ".##..", ".##..", ".....", ".##..", ".##..", ".#..."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "(": ["...##", "..#..", ".#...", ".#...", ".#...", "..#..", "...##"],
  ")": ["##...", "..#..", "...#.", "...#.", "...#.", "..#..", "##..."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  '"': [".#.#.", ".#.#.", ".#.#.", ".....", ".....", ".....", "....."],
  "#": [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."],
  "$": ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
  "%": ["##..#", "##.#.", "...#.", "..#..", ".#...", "#.##.", "#..##"],
  "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
  "/": ["....#", "...#.", "...#.", "..#..", "..#..", ".#...", "#...."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  "*": [".....", ".#.#.", ".###.", "#####", ".###.", ".#.#.", "....."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "=": [".....", ".....", "#####", ".....", "#####", ".....", "....."],
  "@": [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".###."],
  "_": [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
};

type RGBA = [number, number, number, number];

const PAPER: RGBA = [246, 241, 227, 255];
const NAVY: RGBA = [31, 42, 68, 255];
const NAVY_LT: RGBA = [58, 74, 110, 255];
const RED: RGBA = [178, 34, 34, 255];
const MAGENTA: RGBA = [224, 33, 138, 255];
const MAGENTA_DK: RGBA = [176, 18, 104, 255];
const BLACK: RGBA = [20, 20, 20, 255];
const WHITE: RGBA = [255, 255, 255, 255];
const GRAY: RGBA = [90, 90, 90, 255];
const GRAY_LT: RGBA = [200, 196, 182, 255];
const SKIN: RGBA = [232, 190, 150, 255];
const PINK: RGBA = [244, 170, 190, 255];
const GOLD: RGBA = [212, 175, 55, 255];
const PHOTO_BG: RGBA = [168, 190, 214, 255];

// ---------------------------------------------------------------------------
// Raster canvas (RGBA, row-major)
// ---------------------------------------------------------------------------
const px = Buffer.alloc(W * H * 4);

function setPixel(x: number, y: number, c: RGBA): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
  px[i + 3] = c[3];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGBA): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) setPixel(xx, yy, c);
  }
}

function rectOutline(x: number, y: number, w: number, h: number, t: number, c: RGBA): void {
  fillRect(x, y, w, t, c);
  fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c);
  fillRect(x + w - t, y, t, h, c);
}

function fillCircle(cx: number, cy: number, r: number, c: RGBA): void {
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(x, y, c);
    }
  }
}

function circleOutline(cx: number, cy: number, r: number, t: number, c: RGBA): void {
  for (let k = 0; k < t; k++) {
    const rr = r - k;
    const rr2 = rr * rr;
    const ri2 = (rr - 1) * (rr - 1);
    for (let y = Math.floor(cy - rr); y <= Math.ceil(cy + rr); y++) {
      for (let x = Math.floor(cx - rr); x <= Math.ceil(cx + rr); x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 <= rr2 && d2 > ri2) setPixel(x, y, c);
      }
    }
  }
}

function drawLine(x0: number, y0: number, x1: number, y1: number, t: number, c: RGBA): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    fillCircle(x, y, Math.max(1, Math.floor(t / 2)), c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function drawArc(cx: number, cy: number, r: number, a0: number, a1: number, t: number, c: RGBA): void {
  for (let a = a0; a <= a1; a += 0.02) {
    const x = Math.round(cx + r * Math.cos(a));
    const y = Math.round(cy + r * Math.sin(a));
    fillCircle(x, y, Math.max(1, Math.floor(t / 2)), c);
  }
}

function drawStar(cx: number, cy: number, rOuter: number, rInner: number, c: RGBA): void {
  // 5-point star polygon, filled by scanline over its bounding box.
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const minY = Math.floor(cy - rOuter);
  const maxY = Math.ceil(cy + rOuter);
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < 10; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % 10];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) setPixel(x, y, c);
    }
  }
}

// ---------------------------------------------------------------------------
// Text rendering on the bitmap font
// ---------------------------------------------------------------------------
function glyphWidth(scale: number): number {
  return 6 * scale; // 5 px glyph + 1 px gap
}

function textWidth(text: string, scale: number): number {
  let w = 0;
  for (const ch of text) {
    if (FONT[ch]) w += glyphWidth(scale);
  }
  return Math.max(0, w - scale);
}

function drawText(text: string, x: number, y: number, scale: number, c: RGBA): void {
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (const ch of text) {
    const g = FONT[ch];
    if (g) {
      for (let r = 0; r < 7; r++) {
        for (let col = 0; col < 5; col++) {
          if (g[r][col] === "#") {
            fillRect(cx + col * scale, cy + r * scale, scale, scale, c);
          }
        }
      }
      cx += glyphWidth(scale);
    }
  }
}

function drawTextCentered(text: string, cx: number, y: number, scale: number, c: RGBA): void {
  drawText(text, cx - textWidth(text, scale) / 2, y, scale, c);
}

function wrapText(text: string, maxWidth: number, scale: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur === "" ? w : cur + " " + w;
    if (textWidth(test, scale) <= maxWidth) {
      cur = test;
    } else {
      if (cur !== "") lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

function drawPara(text: string, x: number, y: number, maxWidth: number, scale: number, c: RGBA, lineH: number): number {
  const lines = wrapText(text, maxWidth, scale);
  let yy = y;
  for (const ln of lines) {
    drawText(ln, x, yy, scale, c);
    yy += lineH;
  }
  return yy;
}

// ---------------------------------------------------------------------------
// The make.fun ghost, drawn in code: white rounded ghost, sparkle eyes,
// magenta star coin. Drawn as the DMV clerk stamping the form.
// ---------------------------------------------------------------------------
function drawGhost(cx: number, topY: number, w: number, h: number): void {
  const r = w / 2;
  const headCy = topY + r;
  const bodyBottom = topY + h - 18;
  const scallopR = w / 6;
  // Navy outline: same silhouette, slightly larger, drawn first.
  const o = 4;
  fillCircle(cx, headCy, r + o, NAVY);
  fillRect(cx - r - o, headCy, 2 * (r + o), bodyBottom - headCy + o, NAVY);
  for (let i = 0; i < 3; i++) {
    const sx = cx - r + scallopR + i * 2 * scallopR;
    fillCircle(sx, bodyBottom + o, scallopR + o, NAVY);
  }
  // White body on top.
  fillCircle(cx, headCy, r, WHITE);
  fillRect(cx - r, headCy, 2 * r, bodyBottom - headCy, WHITE);
  for (let i = 0; i < 3; i++) {
    const sx = cx - r + scallopR + i * 2 * scallopR;
    fillCircle(sx, bodyBottom, scallopR, WHITE);
  }
  // Sparkle eyes (black ovals with white glints).
  const eyeY = headCy - 8;
  const eyeDx = 34;
  const eyeRx = 13;
  const eyeRy = 17;
  for (const s of [-1, 1]) {
    for (let y = eyeY - eyeRy; y <= eyeY + eyeRy; y++) {
      for (let x = cx + s * eyeDx - eyeRx; x <= cx + s * eyeDx + eyeRx; x++) {
        const dx = (x - (cx + s * eyeDx)) / eyeRx;
        const dy = (y - eyeY) / eyeRy;
        if (dx * dx + dy * dy <= 1) setPixel(x, y, BLACK);
      }
    }
    fillCircle(cx + s * eyeDx - 4, eyeY - 7, 4, WHITE);
  }
  // Smile.
  drawArc(cx, headCy + 22, 22, Math.PI * 0.15, Math.PI * 0.85, 4, BLACK);
  // Blush.
  fillCircle(cx - 62, headCy + 26, 9, PINK);
  fillCircle(cx + 62, headCy + 26, 9, PINK);
  // Left arm waving.
  drawLine(cx - r + 6, headCy + 78, cx - r - 34, headCy + 40, 7, NAVY);
  drawLine(cx - r + 6, headCy + 78, cx - r - 34, headCy + 40, 3, WHITE);
  // Right arm reaching to the stamp.
  drawLine(cx + r - 6, headCy + 78, cx + r + 44, headCy + 96, 7, NAVY);
  drawLine(cx + r - 6, headCy + 78, cx + r + 44, headCy + 96, 3, WHITE);
}

// Magenta star coin held up by the ghost.
function drawStarCoin(cx: number, cy: number): void {
  fillCircle(cx, cy, 34, GOLD);
  circleOutline(cx, cy, 34, 3, MAGENTA_DK);
  drawStar(cx, cy, 26, 11, MAGENTA);
  drawStar(cx, cy, 15, 6, WHITE);
}

// ---------------------------------------------------------------------------
// License photo: Leonidas M. Vice, 13 years older, still waiting.
// ---------------------------------------------------------------------------
function drawPortrait(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, PHOTO_BG);
  rectOutline(x, y, w, h, 3, NAVY);
  const cx = x + w / 2;
  // Shoulders / shirt.
  fillRect(x + 28, y + h - 52, w - 56, 52, NAVY_LT);
  // Neck + head.
  fillRect(cx - 16, y + 118, 32, 26, SKIN);
  fillCircle(cx, y + 88, 46, SKIN);
  // Cap.
  fillRect(cx - 50, y + 34, 100, 22, NAVY);
  fillRect(cx - 58, y + 54, 116, 10, NAVY);
  // Sunglasses (he has seen things since 2013).
  fillRect(cx - 40, y + 78, 34, 16, BLACK);
  fillRect(cx + 6, y + 78, 34, 16, BLACK);
  drawLine(cx - 6, y + 84, cx + 6, y + 84, 3, BLACK);
  // Tired smile.
  drawArc(cx, y + 112, 14, Math.PI * 0.15, Math.PI * 0.85, 3, BLACK);
  // Grey streak in the hair, earned while waiting.
  drawLine(cx - 30, y + 56, cx - 10, y + 60, 4, GRAY_LT);
  drawTextCentered("PHOTO", cx, y + h - 22, 1, WHITE);
}

// ---------------------------------------------------------------------------
// Document layout — Leonida DMV Driver License Renewal notice, 1024x1024.
// ---------------------------------------------------------------------------
function render(): void {
  // Paper.
  fillRect(0, 0, W, H, PAPER);
  rectOutline(12, 12, W - 24, H - 24, 5, NAVY);
  rectOutline(26, 26, W - 52, H - 52, 2, NAVY);

  // Header band.
  fillRect(26, 26, W - 52, 118, NAVY);
  drawTextCentered("STATE OF LEONIDA", W / 2, 48, 4, WHITE);
  drawTextCentered("DEPARTMENT OF MOTOR VEHICLES", W / 2, 100, 2, WHITE);
  // Small stars flanking the header.
  drawStar(90, 86, 16, 7, GOLD);
  drawStar(W - 90, 86, 16, 7, GOLD);

  // Title.
  drawTextCentered("DRIVER LICENSE RENEWAL NOTICE", W / 2, 168, 3, RED);
  drawLine(80, 208, W - 80, 208, 3, RED);
  drawTextCentered("NOTICE NO. DMV-2026-04811   -   LEONIDA CITY, FL", W / 2, 222, 1, GRAY);

  // License photo, top right.
  drawPortrait(806, 248, 156, 196);

  // Holder fields, left column.
  const fx = 60;
  let fy = 252;
  const lh = 36;
  drawText("HOLDER:", fx, fy, 2, NAVY);
  drawText("LEONIDAS M. VICE", fx + 150, fy, 2, BLACK);
  fy += lh;
  drawText("LICENSE NO:", fx, fy, 2, NAVY);
  drawText("L-2013-0917-VI", fx + 150, fy, 2, BLACK);
  fy += lh;
  drawText("ISSUED:", fx, fy, 2, NAVY);
  drawText("SEP 17, 2013", fx + 150, fy, 2, BLACK);
  fy += lh;
  drawText("EXPIRED:", fx, fy, 2, NAVY);
  drawText("WHILE YOU WAITED", fx + 150, fy, 2, RED);
  fy += lh;
  drawText("STATUS:", fx, fy, 2, NAVY);
  drawText("RENEWED - SEE BELOW", fx + 150, fy, 2, BLACK);

  // Body paragraph.
  const bodyY = drawPara(
    "DEAR DRIVER, YOUR LICENSE EXPIRED DURING THE 13-YEAR WAIT FOR GRAND THEFT AUTO VI. GOOD NEWS: IT HAS BEEN RENEWED.",
    60, 468, 904, 2, BLACK, 34,
  );

  // The punchline, big and red.
  drawTextCentered("NEW EXPIRY: THE DAY GTA VI LAUNCHES", W / 2, bodyY + 10, 3, RED);

  // Fee + queue lines.
  let ly = bodyY + 56;
  drawText("RENEWAL FEE: WAIVED - PAID IN PATIENCE SINCE 2013.", 60, ly, 2, BLACK);
  ly += 32;
  drawText("QUEUE NUMBER: YOU ARE #4,811 IN LINE. KEEP WAITING.", 60, ly, 2, BLACK);
  ly += 32;
  drawText("BRING THIS NOTICE, TWO FORMS OF ID, AND GTA V.", 60, ly, 2, BLACK);

  // --- Ghost clerk scene, bottom of the form ---
  const ghostCx = 250;
  const ghostTop = 676;
  drawGhost(ghostCx, ghostTop, 190, 250);
  // Star coin held up beside the ghost.
  drawStarCoin(ghostCx + 168, ghostTop + 92);
  // APPROVED stamp, at the ghost's reaching hand.
  const sx = 400;
  const sy = 812;
  rectOutline(sx, sy, 210, 74, 5, RED);
  rectOutline(sx + 8, sy + 8, 194, 58, 2, RED);
  drawTextCentered("APPROVED", sx + 105, sy + 16, 3, RED);
  drawTextCentered("MAKE.FUN DMV - 2026", sx + 105, sy + 50, 1, RED);

  // make.fun issuing-authority seal.
  const sealCx = 812;
  const sealCy = 806;
  fillCircle(sealCx, sealCy, 96, MAGENTA);
  fillCircle(sealCx, sealCy, 84, PAPER);
  circleOutline(sealCx, sealCy, 84, 3, MAGENTA);
  drawStar(sealCx, sealCy - 52, 12, 5, MAGENTA);
  drawTextCentered("MAKE.FUN", sealCx, sealCy - 16, 3, MAGENTA_DK);
  drawTextCentered("ISSUING", sealCx, sealCy + 22, 1, MAGENTA_DK);
  drawTextCentered("AUTHORITY", sealCx, sealCy + 38, 1, MAGENTA_DK);
  drawStar(sealCx, sealCy + 62, 10, 4, MAGENTA);

  // Clerk signature line under the ghost.
  drawLine(120, 950, 380, 950, 2, NAVY);
  drawTextCentered("CLERK: THE MAKE.FUN GHOST", 250, 958, 1, NAVY);

  // Small print, bottom.
  drawTextCentered("SMALL PRINT: VALID FOR DRIVING IN LEONIDA ONLY. DOES NOT COVER FLYING, SWIMMING, OR WAITING.", W / 2, 972, 1, GRAY);
  drawTextCentered("IF GTA VI IS DELAYED AGAIN, THIS LICENSE RENEWS ITSELF. DO NOT LAMINATE YOUR PATIENCE.", W / 2, 986, 1, GRAY);
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder: RGBA raster -> zlib deflate, filter 0 per scanline.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0; // filter: none
    px.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Main: render, write meme.png to the output dir, copy POST.json alongside.
// ---------------------------------------------------------------------------
function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
  render();
  const png = encodePng();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "meme.png"), png);
  const postSrc = path.join(botDir, "POST.json");
  const postDst = path.join(outDir, "POST.json");
  fs.copyFileSync(postSrc, postDst);
  process.stdout.write(`wrote ${path.join(outDir, "meme.png")} (${png.length} bytes)\n`);
}

main();
