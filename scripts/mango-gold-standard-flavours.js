/**
 * Clean reference photo — cup stays untouched.
 * Mango = pristine reference + #FFF9C4 background only.
 * Other flavours = same cup, photo swirl warp + photo-faithful recolor.
 * NO cutout. NO master-cup composite. NO heavy matte/blur passes.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

const SRC_CANDIDATES = [
  path.join(__dirname, "../assets/perfect-cup.jpg"),
  "C:/Users/USER/.cursor/projects/c-Users-USER-Desktop-websites-FRUITBOOSTER/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_b3da889108892b86c488972edbadfcac_images_image-84e34d23-71e0-4915-a0c0-b5bb1df7dcb2.jpg",
  "C:/Users/USER/.cursor/projects/c-Users-USER-Desktop-websites-FRUITBOOSTER/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_b3da889108892b86c488972edbadfcac_images_image-bf271d21-123c-4a70-9e4e-45b05200212e.jpg",
];
const OUT = path.join(__dirname, "../public/products");
const MASTER_DIR = path.join(__dirname, "../assets/master");
const CANVAS_W = 720;
const CANVAS_H = 1080;
const CREAM = { r: 255, g: 249, b: 196 };
const PLATE = { r: 254, g: 249, b: 181 };
const PAD_TOP = 0;
const FILL = 0.84;
const SHADOW_STRENGTH = 0.11;

const SEED_BERRY = [92, 28, 38];
const SEED_BLUE = [62, 38, 78];
const FLAKE = [248, 242, 228];
const CREAM_RIBBON = [245, 232, 214];

/**
 * Unique swirls — same photo realism, different mound shape per flavour.
 * Other flavours = same cup, in-place photo swirl warp + recolor (no cream erase).
 */
const FLAVOURS = [
  { dest: "mango-hurrican.jpg", keepPhoto: true },
  {
    dest: "mango-hurrican-tropical.jpg",
    peak: [255, 178, 58],
    valley: [226, 96, 28],
    accent: [255, 140, 48],
    marble: 0.42,
    satBoost: 0.08,
    grain: 0.1,
    freq: 1.2,
    flipX: true,
    fold: 3.2,
    squat: 0.97,
    seed: 11,
  },
  {
    dest: "regular-tropical-tornado.jpg",
    peak: [255, 168, 72],
    valley: [210, 82, 36],
    accent: [255, 148, 56],
    marble: 0.48,
    satBoost: 0.06,
    frost: 0.1,
    grain: 0.12,
    freq: 0.86,
    fold: -4.5,
    squat: 0.94,
    pinch: 0.97,
    seed: 23,
  },
  {
    dest: "regular-breezy-banana.jpg",
    peak: [255, 220, 96],
    valley: [196, 152, 36],
    accent: [248, 198, 120],
    creamy: 0.22,
    satBoost: 0.12,
    grain: 0.05,
    freq: 0.62,
    flipX: true,
    fold: 2.4,
    squat: 0.96,
    seed: 31,
  },
  {
    dest: "regular-strawbery-sunshine.jpg",
    peak: [255, 118, 122],
    valley: [188, 36, 52],
    accent: [255, 168, 112],
    marble: 0.32,
    creamy: 0.08,
    satBoost: 0.1,
    grain: 0.1,
    freq: 1.05,
    fold: 5.0,
    squat: 0.95,
    pinch: 0.98,
    seed: 47,
  },
  {
    dest: "straybery-sunshine-berry.jpg",
    peak: [214, 68, 98],
    valley: [118, 20, 48],
    accent: [168, 42, 78],
    marble: 0.42,
    satBoost: 0.12,
    specks: { color: SEED_BERRY, density: 0.012 },
    grain: 0.12,
    freq: 1.45,
    flipX: true,
    fold: -3.8,
    squat: 0.93,
    seed: 53,
  },
  {
    dest: "regular-very-berry.jpg",
    peak: [188, 52, 112],
    valley: [88, 14, 48],
    accent: [148, 34, 90],
    marble: 0.34,
    satBoost: 0.14,
    specks: { color: SEED_BERRY, density: 0.018 },
    grain: 0.14,
    freq: 1.3,
    fold: 4.2,
    squat: 0.92,
    pinch: 0.96,
    seed: 67,
  },
  {
    dest: "regular-the-original.jpg",
    peak: [255, 168, 86],
    valley: [210, 88, 42],
    accent: [236, 124, 64],
    marble: 0.34,
    satBoost: 0.06,
    grain: 0.1,
    freq: 0.92,
    fold: -2.6,
    squat: 0.98,
    seed: 71,
  },
  {
    dest: "regular-banana-a-whey.jpg",
    peak: [252, 216, 128],
    valley: [186, 148, 58],
    accent: [236, 200, 148],
    creamy: 0.32,
    satBoost: 0.08,
    grain: 0.04,
    freq: 0.55,
    flipX: true,
    fold: 1.8,
    squat: 0.94,
    pinch: 0.99,
    seed: 83,
  },
  {
    dest: "regular-ripped-berry.jpg",
    peak: [142, 84, 192],
    valley: [56, 24, 92],
    accent: [112, 54, 148],
    marble: 0.32,
    satBoost: 0.12,
    specks: { color: SEED_BLUE, density: 0.014 },
    grain: 0.26,
    freq: 1.18,
    fold: -5.2,
    squat: 0.91,
    pinch: 0.95,
    seed: 97,
  },
  {
    dest: "regular-strawberry-storm.jpg",
    peak: [255, 68, 72],
    valley: [158, 18, 32],
    accent: [214, 42, 68],
    marble: 0.3,
    satBoost: 0.14,
    specks: { color: SEED_BERRY, density: 0.01 },
    grain: 0.3,
    freq: 1.6,
    flipX: true,
    fold: 3.6,
    squat: 0.9,
    seed: 101,
  },
  {
    dest: "regular-nuttin-butter.jpg",
    peak: [210, 158, 92],
    valley: [142, 90, 40],
    accent: [180, 124, 68],
    creamy: 0.14,
    satBoost: 0.04,
    grain: 0.06,
    freq: 0.5,
    fold: -1.9,
    squat: 0.96,
    pinch: 0.97,
    seed: 109,
  },
  {
    dest: "regular-coco-crush.jpg",
    peak: [248, 236, 210],
    valley: [186, 158, 118],
    accent: [228, 210, 176],
    creamy: 0.2,
    satBoost: 0.04,
    specks: { color: FLAKE, density: 0.012 },
    grain: 0.06,
    freq: 0.8,
    flipX: true,
    fold: 2.8,
    squat: 0.95,
    seed: 127,
  },
  {
    dest: "regular-pineapple-freeze.jpg",
    peak: [255, 228, 64],
    valley: [214, 160, 24],
    accent: [255, 206, 88],
    marble: 0.28,
    satBoost: 0.16,
    frost: 0.32,
    grain: 0.22,
    freq: 1.12,
    fold: 4.8,
    squat: 0.93,
    pinch: 0.96,
    seed: 131,
  },
  {
    dest: "regular-funky-monkey.jpg",
    peak: [158, 102, 64],
    valley: [72, 38, 20],
    accent: [118, 74, 44],
    marble: 0.24,
    satBoost: 0.04,
    grain: 0.16,
    freq: 0.74,
    flipX: true,
    fold: -4.0,
    squat: 0.92,
    pinch: 0.98,
    seed: 149,
  },
  {
    dest: "canada-colada.jpg",
    peak: [252, 238, 178],
    valley: [214, 182, 86],
    accent: [255, 224, 124],
    creamy: 0.28,
    marble: 0.3,
    satBoost: 0.05,
    specks: { color: FLAKE, density: 0.014 },
    grain: 0.07,
    freq: 0.88,
    fold: 1.5,
    squat: 0.97,
    seed: 157,
  },
  {
    dest: "berry-cream-sensation.jpg",
    peak: [255, 168, 182],
    valley: [148, 38, 60],
    accent: CREAM_RIBBON,
    marble: 0.52,
    creamy: 0.38,
    satBoost: 0.06,
    grain: 0.12,
    freq: 1.28,
    flipX: true,
    fold: -2.2,
    squat: 0.94,
    pinch: 0.97,
    seed: 173,
  },
  {
    dest: "paw-paw-passion.jpg",
    peak: [255, 196, 58],
    valley: [214, 92, 32],
    accent: [255, 108, 58],
    marble: 0.4,
    satBoost: 0.1,
    grain: 0.14,
    freq: 1.18,
    fold: 3.0,
    squat: 0.96,
    pinch: 0.98,
    seed: 181,
  },
];

function clamp(n) {
  return n < 0 ? 0 : n > 255 ? 255 : n | 0;
}
function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function satLum(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return { sat: max === 0 ? 0 : (max - min) / max, lum: (r + g + b) / 3 };
}
function isPlate(r, g, b) {
  const dPlate = Math.hypot(r - PLATE.r, g - PLATE.g, b - PLATE.b);
  const dCream = Math.hypot(r - CREAM.r, g - CREAM.g, b - CREAM.b);
  const { sat, lum } = satLum(r, g, b);
  return dPlate < 18 || dCream < 18 || (sat < 0.22 && lum > 218);
}
function isPurpleBand(r, g, b) {
  const { sat } = satLum(r, g, b);
  return b > 50 && r > g + 10 && sat > 0.28 && b >= r - 20;
}
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, l];
}
function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
function hslToRgb(h, s, l) {
  h /= 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}
function lerpHue(a, b, t) {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  let h = a + d * t;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;
  return h;
}
function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function hash2(x, y, seed) {
  let n = x * 374761393 + y * 668265263 + seed * 1274126177;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function mixField(x, y, seed, freq) {
  const f = freq || 1;
  return (
    (Math.sin(x * 0.018 * f + y * 0.027 * f + seed) +
      Math.sin(x * 0.041 * f - y * 0.013 * f + seed * 1.7) * 0.65 +
      Math.sin((x + y) * 0.012 * f + seed * 2.3) * 0.45) *
      0.5 +
    0.5
  );
}
function findSrc() {
  for (const p of SRC_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error("Master cup photo not found");
}

function floodPlate(data, width, height) {
  const bg = new Uint8Array(width * height);
  const q = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (bg[idx]) return;
    const i = idx * 3;
    if (!isPlate(data[i], data[i + 1], data[i + 2])) return;
    bg[idx] = 1;
    q.push(idx);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (q.length) {
    const idx = q.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return bg;
}

function findPurpleRim(data, width, height, plate) {
  let first = -1;
  let last = -1;
  let left = width;
  let right = 0;
  for (let y = 0; y < Math.floor(height * 0.55); y++) {
    let pur = 0;
    let sub = 0;
    let L = -1;
    let R = -1;
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (plate[p]) continue;
      sub++;
      const i = p * 3;
      if (isPurpleBand(data[i], data[i + 1], data[i + 2])) {
        pur++;
        if (L < 0) L = x;
        R = x;
      }
    }
    if (pur > 40 && pur > sub * 0.18) {
      if (first < 0) first = y;
      last = y;
      if (L >= 0 && L < left) left = L;
      if (R > right) right = R;
    } else if (first >= 0 && y > first + 90) break;
  }
  return { first, last, left, right, width: Math.max(1, right - left + 1) };
}

function swirlMask(data, width, height, plate, rimY) {
  const hard = new Uint8Array(width * height);
  const cut = rimY + 16;
  for (let y = 0; y <= cut; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (plate[p]) continue;
      const i = p * 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isPurpleBand(r, g, b)) continue;
      const { sat, lum } = satLum(r, g, b);
      if (lum > 210 && sat < 0.16) continue;
      if (sat < 0.18 && lum > 190) continue;
      hard[p] = 1;
    }
  }
  const weight = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += hard[p + dy * width + dx];
      weight[p] = n / 9;
    }
  }
  return weight;
}

function swirlBounds(weight, width, height) {
  let top = height;
  let left = width;
  let right = 0;
  let cx = 0;
  let n = 0;
  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.4) continue;
    const x = p % width;
    const y = (p / width) | 0;
    if (y < top) top = y;
    if (x < left) left = x;
    if (x > right) right = x;
    cx += x;
    n++;
  }
  return { top, left, right, cx: n ? cx / n : width / 2 };
}

function surfaceY(x, job, rimY, swirlTop, cx, halfW) {
  const origH = Math.max(8, rimY - swirlTop);
  const mound = Math.max(0.34, job.mound == null ? 1 : job.mound);
  const nx = (x - cx) / Math.max(20, halfW);
  const nxc = Math.min(1.3, Math.max(-1.3, nx));
  const shape = job.shape || "spiral";
  const seed = job.seed || 1;
  const phase = seed * 0.17;
  const h = origH * mound;
  let y = rimY - h;
  y += nxc * nxc * h * (job.dome == null ? 0.5 : job.dome);

  if (shape === "spiral") return swirlTop - 6;
  if (shape === "flat") {
    return rimY - origH * 0.36 - Math.cos(nxc * 1.2) * origH * 0.08;
  }
  if (shape === "pillowy") {
    y -= Math.cos(nxc * 2.2 + phase) * h * 0.18;
    y -= Math.cos(nxc * 4.6 + phase * 1.4) * h * 0.08;
  } else if (shape === "chunky") {
    y += Math.sin(nxc * 4.2 + phase) * h * 0.12;
    y += Math.sin(nxc * 7.1 + phase * 0.7) * h * 0.07;
  } else if (shape === "jagged") {
    y += Math.sin(nxc * 5.4 + phase) * h * 0.16;
    y += Math.sin(nxc * 9.2 + phase * 1.3) * h * 0.1;
    y += Math.sin(nxc * 2.4 + phase * 0.5) * h * 0.08;
  } else if (shape === "pebbly") {
    y += Math.sin(nxc * 8.2 + phase) * h * 0.1;
    y += Math.sin(nxc * 13.5 + phase * 1.1) * h * 0.05;
  } else if (shape === "dome") {
    y += Math.sin(nxc * 2.8 + phase) * h * 0.05;
  }
  return y;
}

function applyGrain(pixels, weight, width, height, job) {
  const g = job.grain || 0;
  if (g < 0.04) return;
  const seed = job.seed || 1;
  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.2) continue;
    const x = p % width;
    const y = (p / width) | 0;
    const n =
      (hash2(x, y, seed) - 0.5) * 0.55 +
      (hash2((x / 3) | 0, (y / 3) | 0, seed + 9) - 0.5) * 0.45;
    const d = n * g * 38;
    const i = p * 3;
    pixels[i] = clamp(pixels[i] + d);
    pixels[i + 1] = clamp(pixels[i + 1] + d);
    pixels[i + 2] = clamp(pixels[i + 2] + d);
  }
}

function sampleSwirl(pixels, weight, width, height, x, y) {
  if (x < 1 || y < 1 || x >= width - 2 || y >= height - 2) return null;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const corners = [
    [x0, y0, (1 - fx) * (1 - fy)],
    [x0 + 1, y0, fx * (1 - fy)],
    [x0, y0 + 1, (1 - fx) * fy],
    [x0 + 1, y0 + 1, fx * fy],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let wsum = 0;
  for (const [cx, cy, wt] of corners) {
    const p = cy * width + cx;
    const w = weight[p];
    if (w < 0.08) continue;
    const i = p * 3;
    const ww = w * wt;
    r += pixels[i] * ww;
    g += pixels[i + 1] * ww;
    b += pixels[i + 2] * ww;
    wsum += ww;
  }
  if (wsum < 0.08) return null;
  return { r: r / wsum, g: g / wsum, b: b / wsum, w: Math.min(1, wsum) };
}

function warpSwirl(pixels, weight, width, height, rimY, job, plate) {
  const stretch = job.stretch == null ? 1 : job.stretch;
  const twist = job.twist || 0;
  const lean = job.lean || 0;
  const bulge = job.bulge == null ? 1 : job.bulge;
  const bounds = swirlBounds(weight, width, height);
  const rimCap = rimY - 2;
  const xLo = Math.max(0, bounds.left - 16 + Math.min(0, lean));
  const xHi = Math.min(width - 1, bounds.right + 16 + Math.max(0, lean));

  if (stretch === 1 && !twist && !lean && bulge === 1) {
    return { pixels, weight };
  }

  const cx = bounds.cx + lean;
  const orig = Buffer.from(pixels);
  const origW = Float32Array.from(weight);
  const out = Buffer.from(pixels);
  const outW = Float32Array.from(weight);

  for (let p = 0; p < width * height; p++) {
    const y = (p / width) | 0;
    const x = p % width;
    if (origW[p] < 0.04 || y >= rimCap || x < xLo || x > xHi) continue;
    const i = p * 3;
    out[i] = CREAM.r;
    out[i + 1] = CREAM.g;
    out[i + 2] = CREAM.b;
    outW[p] = 0;
  }

  const y0 = Math.max(0, bounds.top - 20);
  const y1 = Math.min(rimCap - 1, bounds.top + Math.round((rimCap - bounds.top) * stretch) + 24);
  const x0 = Math.max(0, xLo - 8);
  const x1 = Math.min(width - 1, xHi + 8);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = y * width + x;
      const dx = (x - cx) / bulge;
      const dy = (rimCap - y) / stretch;
      const t = twist * (dy / 160);
      const sx = bounds.cx + dx * Math.cos(t);
      const sy = rimCap - dy;
      if (sy >= rimCap || sy < 0) continue;
      const s = sampleSwirl(orig, origW, width, height, sx, sy);
      if (!s) continue;
      const i = p * 3;
      out[i] = Math.round(s.r);
      out[i + 1] = Math.round(s.g);
      out[i + 2] = Math.round(s.b);
      outW[p] = s.w;
    }
  }

  return { pixels: out, weight: outW };
}

/** Keep swirl flush with rim when warp shortens the mound (stretch < 1). */
function fillRimSeat(pixels, base, width, height, rimY, job, albedoY) {
  let left = width;
  let right = 0;
  for (let y = Math.max(0, rimY - 30); y < rimY; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const { sat, lum } = satLum(base[i], base[i + 1], base[i + 2]);
      if (sat > 0.2 && lum < 220 && !isPurpleBand(base[i], base[i + 1], base[i + 2])) {
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (right <= left) return;

  for (let y = Math.max(0, rimY - 28); y < rimY; y++) {
    for (let x = left; x <= right; x++) {
      const p = y * width + x;
      const i = p * 3;
      if (isPurpleBand(base[i], base[i + 1], base[i + 2])) continue;
      const srcSat = satLum(base[i], base[i + 1], base[i + 2]).sat;
      if (srcSat < 0.16) continue;
      const dr = pixels[i] - CREAM.r;
      const dg = pixels[i + 1] - CREAM.g;
      const db = pixels[i + 2] - CREAM.b;
      const nearCream = Math.hypot(dr, dg, db) < 32;
      const outSat = satLum(pixels[i], pixels[i + 1], pixels[i + 2]).sat;
      if (!nearCream && outSat > 0.12) continue;
      const [nr, ng, nb] = recolorPixel(base[i], base[i + 1], base[i + 2], x, y, job, albedoY);
      pixels[i] = nr;
      pixels[i + 1] = ng;
      pixels[i + 2] = nb;
    }
  }
}

function sculptMound(pixels, weight, width, height, rimY, job) {
  const b = swirlBounds(weight, width, height);
  const halfW = (b.right - b.left) / 2;
  const feather = 6;
  const cut = rimY + 16;

  for (let x = b.left; x <= b.right; x++) {
    let minY = height;
    let maxY = -1;
    let sr = 0;
    let sg = 0;
    let sb = 0;
    let sn = 0;
    for (let y = 0; y <= cut; y++) {
      const p = y * width + x;
      if (weight[p] < 0.28) continue;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const i = p * 3;
      sr += pixels[i];
      sg += pixels[i + 1];
      sb += pixels[i + 2];
      sn++;
    }
    if (!sn || maxY < 0) continue;
    sr = Math.round(sr / sn);
    sg = Math.round(sg / sn);
    sb = Math.round(sb / sn);
    const sy = Math.round(surfaceY(x, job, rimY, b.top, b.cx, halfW));
    const fillBottom = Math.min(maxY, rimY - 1);

    for (let y = 0; y < sy; y++) {
      const p = y * width + x;
      if (weight[p] < 0.04) continue;
      const dist = sy - y;
      const i = p * 3;
      if (dist > feather) {
        pixels[i] = CREAM.r;
        pixels[i + 1] = CREAM.g;
        pixels[i + 2] = CREAM.b;
        weight[p] = 0;
      } else {
        const t = dist / feather;
        pixels[i] = Math.round(pixels[i] * (1 - t) + CREAM.r * t);
        pixels[i + 1] = Math.round(pixels[i + 1] * (1 - t) + CREAM.g * t);
        pixels[i + 2] = Math.round(pixels[i + 2] * (1 - t) + CREAM.b * t);
      }
    }

    for (let y = sy; y <= fillBottom; y++) {
      const p = y * width + x;
      const i = p * 3;
      if (weight[p] >= 0.28) continue;
      const shade = 1 - ((y - sy) / Math.max(1, maxY - sy)) * 0.08;
      pixels[i] = clamp(Math.round(sr * shade));
      pixels[i + 1] = clamp(Math.round(sg * shade));
      pixels[i + 2] = clamp(Math.round(sb * shade));
      weight[p] = 0.85;
    }
  }

  applyGrain(pixels, weight, width, height, job);
}

function masterCupRgba(data, plate, weight, width, height, rimY) {
  const rgba = Buffer.alloc(width * height * 4);
  let purpleTop = rimY;
  for (let y = Math.max(0, rimY - 40); y <= rimY + 30; y++) {
    for (let x = 0; x < width; x++) {
      if (plate[y * width + x]) continue;
      const i = (y * width + x) * 3;
      if (isPurpleBand(data[i], data[i + 1], data[i + 2]) && y < purpleTop) purpleTop = y;
    }
  }
  for (let p = 0; p < width * height; p++) {
    const i3 = p * 3;
    const i4 = p * 4;
    const y = (p / width) | 0;
    if (plate[p]) {
      rgba[i4 + 3] = 0;
      continue;
    }
    if (y < purpleTop - 2) {
      rgba[i4 + 3] = 0;
      continue;
    }
    if (y < rimY + 8) {
      if (isPurpleBand(data[i3], data[i3 + 1], data[i3 + 2])) {
        rgba[i4] = data[i3];
        rgba[i4 + 1] = data[i3 + 1];
        rgba[i4 + 2] = data[i3 + 2];
        rgba[i4 + 3] = 255;
        continue;
      }
      const { sat, lum } = satLum(data[i3], data[i3 + 1], data[i3 + 2]);
      if (y >= purpleTop - 2 && y <= purpleTop + 14 && lum > 205 && sat < 0.14) {
        rgba[i4] = data[i3];
        rgba[i4 + 1] = data[i3 + 1];
        rgba[i4 + 2] = data[i3 + 2];
        rgba[i4 + 3] = 255;
        continue;
      }
      if (weight[p] > 0.08 || (sat < 0.28 && lum > 170)) {
        rgba[i4 + 3] = 0;
        continue;
      }
    }
    rgba[i4] = data[i3];
    rgba[i4 + 1] = data[i3 + 1];
    rgba[i4 + 2] = data[i3 + 2];
    rgba[i4 + 3] = 255;
  }
  return rgba;
}

/** Source photo has a dark matte 1px outside the cup — make it transparent. */
function stripExteriorShadow(rgba, plate, data, width, height) {
  for (let p = 0; p < width * height; p++) {
    if (rgba[p * 4 + 3] === 0) continue;
    const x = p % width;
    const y = (p / width) | 0;
    let nearPlate = false;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (plate[ny * width + nx]) nearPlate = true;
    }
    if (!nearPlate) continue;
    const i3 = p * 3;
    const { sat, lum } = satLum(data[i3], data[i3 + 1], data[i3 + 2]);
    if (lum < 155 && sat < 0.48) rgba[p * 4 + 3] = 0;
  }
}

/** Drop semi-transparent dark matte pixels that cause black hairlines on cream. */
function cleanMasterAlpha(rgba, width, height) {
  for (let p = 0; p < width * height; p++) {
    const i4 = p * 4;
    const a = rgba[i4 + 3];
    if (a === 0) continue;
    const r = rgba[i4];
    const g = rgba[i4 + 1];
    const b = rgba[i4 + 2];
    const { sat, lum } = satLum(r, g, b);
    if (a < 252 && lum < 155 && sat < 0.42) {
      rgba[i4 + 3] = 0;
      continue;
    }
    if (a < 252 && lum > 198 && sat < 0.16) {
      rgba[i4 + 3] = 0;
      continue;
    }
    // Only muddy semi-transparent EDGE pixels — keep opening transparent
    if (a < 255 && lum < 170 && sat < 0.45) {
      const af = a / 255;
      rgba[i4] = Math.round(r * af + CREAM.r * (1 - af));
      rgba[i4 + 1] = Math.round(g * af + CREAM.g * (1 - af));
      rgba[i4 + 2] = Math.round(b * af + CREAM.b * (1 - af));
      rgba[i4 + 3] = 255;
    }
  }
}

function extractPhotoSwirl(data, weight, width, height, rimY) {
  const rgba = Buffer.alloc(width * height * 4);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let cx = 0;
  let n = 0;
  for (let y = 0; y < rimY + 14; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const w = weight[p];
      if (w < 0.08) continue;
      const i3 = p * 3;
      const i4 = p * 4;
      rgba[i4] = data[i3];
      rgba[i4 + 1] = data[i3 + 1];
      rgba[i4 + 2] = data[i3 + 2];
      // Harden core alpha; keep a short feather only on true soft edges.
      // Near the rim, push alpha up so cream never shows under the purple band.
      let a = Math.min(1, w);
      if (a > 0.55) a = 1;
      else if (y >= rimY - 6) a = Math.min(1, a * 1.35 + 0.25);
      rgba[i4 + 3] = Math.round(255 * a);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      cx += x;
      n++;
    }
  }
  return {
    rgba,
    minX,
    minY,
    maxX,
    maxY,
    cx: n ? cx / n : width / 2,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
}

/** Diffuse luminance field — large-scale fold shading without specular spikes. */
function diffuseLumaField(rgb, weight, width, height, radius) {
  const raw = new Float32Array(width * height);
  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.06) continue;
    const i = p * 3;
    raw[p] = luma(rgb[i], rgb[i + 1], rgb[i + 2]) / 255;
  }
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (weight[p] < 0.06) {
        out[p] = raw[p];
        continue;
      }
      let sum = 0;
      let n = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const q = (y + dy) * width + (x + dx);
          if (q < 0 || q >= width * height || weight[q] < 0.04) continue;
          sum += raw[q];
          n++;
        }
      }
      out[p] = n ? sum / n : raw[p];
    }
  }
  return out;
}

/**
 * Natural lighting for flavour-source swirl only (mango display stays pristine).
 * Keeps pulp colour + fold depth; rolls off studio specular streaks.
 */
function naturalizePhotoSwirlRgba(rgba, weight, width, height) {
  const rgb = Buffer.alloc(width * height * 3);
  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.06) continue;
    const i3 = p * 3;
    const i4 = p * 4;
    rgb[i3] = rgba[i4];
    rgb[i3 + 1] = rgba[i4 + 1];
    rgb[i3 + 2] = rgba[i4 + 2];
  }
  const diffuse = diffuseLumaField(rgb, weight, width, height, 7);

  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.06) continue;
    const i4 = p * 4;
    const r = rgba[i4];
    const g = rgba[i4 + 1];
    const b = rgba[i4 + 2];
    const ly = luma(r, g, b) / 255;
    const dl = diffuse[p];
    const { sat } = satLum(r, g, b);
    const [h, s] = rgbToHsl(r, g, b);

    let shade = dl * 0.86 + ly * 0.14;
    if (ly > dl + 0.035) {
      const spec = Math.min(1, (ly - dl - 0.02) / 0.14) * Math.max(0.08, 1 - sat * 1.1);
      shade = shade * (1 - spec * 0.92) + (dl + 0.03) * spec * 0.92;
    }
    const detail = Math.max(-0.028, Math.min(0.028, (ly - dl) * 0.22));
    shade = Math.min(0.71, Math.max(0.16, shade + detail));

    const [nr, ng, nb] = hslToRgb(h, Math.min(0.9, s), shade);
    rgba[i4] = clamp(Math.round(nr));
    rgba[i4 + 1] = clamp(Math.round(ng));
    rgba[i4 + 2] = clamp(Math.round(nb));
  }
}

function buildDiffuseShading(rgba, weight, width, height) {
  const rgb = Buffer.alloc(width * height * 3);
  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.06) continue;
    const i3 = p * 3;
    const i4 = p * 4;
    rgb[i3] = rgba[i4];
    rgb[i3 + 1] = rgba[i4 + 1];
    rgb[i3 + 2] = rgba[i4 + 2];
  }
  return diffuseLumaField(rgb, weight, width, height, 7);
}

function isNearCream(r, g, b) {
  return Math.hypot(r - CREAM.r, g - CREAM.g, b - CREAM.b) < 26;
}

/** Soft cap on blown white ridge glints — keeps photo gloss, kills painted streaks. */
function photoShadeLy(r, g, b) {
  const rawLy = luma(r, g, b) / 255;
  const { sat } = satLum(r, g, b);
  if (rawLy > 0.66 && sat < 0.4) return 0.66 + (rawLy - 0.66) * 0.32;
  if (rawLy > 0.78) return 0.78 + (rawLy - 0.78) * 0.45;
  return rawLy;
}

function recolorPixel(r, g, b, x, y, job, albedoY) {
  const rawLy = luma(r, g, b) / 255;
  const ly = photoShadeLy(r, g, b);
  const marble = job.marble || 0;
  const accent = job.accent || job.peak;
  const field = mixField(x, y, job.seed || 1, job.freq || 1);
  const peak = lerp3(job.peak, accent, field * marble);
  const valley = lerp3(job.valley, accent, field * marble * 0.55);
  const [ph, ps, pl] = rgbToHsl(peak[0], peak[1], peak[2]);
  const [vh, vs, vl] = rgbToHsl(valley[0], valley[1], valley[2]);
  let ridgeT = Math.min(1, Math.max(0, (ly - 0.12) / 0.66));
  const { sat: srcSat } = satLum(r, g, b);
  if (rawLy > 0.72 && srcSat < 0.28) ridgeT = Math.max(ridgeT, 0.88);
  const hue = lerpHue(vh, ph, ridgeT);
  let s = vs + (ps - vs) * ridgeT;
  let l = vl + (pl - vl) * ridgeT;
  l = Math.min(0.86, Math.max(0.13, l + (ly - albedoY) * 0.72));
  s = Math.min(0.93, s + (job.satBoost || 0));

  if (job.creamy) {
    const ribbon = Math.max(0, Math.sin(x * 0.028 + y * 0.019 + (job.seed || 0)) - 0.52) / 0.48;
    l += (0.82 - l) * ribbon * job.creamy;
    s *= 1 - ribbon * job.creamy * 0.42;
  }
  if (job.frost) {
    const frost = Math.min(1, Math.max(0, (ly - 0.62) / 0.3)) ** 2;
    s *= 1 - frost * (0.32 + job.frost * 0.14);
    l += (0.78 - l) * frost * (0.16 + job.frost * 0.06);
  }

  let [nr, ng, nb] = hslToRgb(hue, s, l);
  if (job.specks && hash2(x, y, job.seed || 1) < job.specks.density) {
    const c = job.specks.color;
    nr = nr * 0.32 + c[0] * 0.68;
    ng = ng * 0.32 + c[1] * 0.68;
    nb = nb * 0.32 + c[2] * 0.68;
  }
  if (job.grain) {
    const n =
      (hash2(x, y, job.seed || 1) - 0.5) * 0.55 +
      (hash2((x / 3) | 0, (y / 3) | 0, (job.seed || 1) + 9) - 0.5) * 0.45;
    const d = n * job.grain * 22;
    nr += d;
    ng += d;
    nb += d;
  }
  const grain = (r + g + b) / 3 - rawLy * 255;
  nr += grain * 0.14;
  ng += grain * 0.14;
  nb += grain * 0.14;
  return [clamp(nr), clamp(ng), clamp(nb)];
}

/**
 * Unique swirl from the reference photo.
 * - Recolor + texture
 * - Optional mirror / fold-shift / squat / pinch
 * Hard rule: never taller or wider than the mango footprint (squat/pinch ≤ 1).
 * Alpha stays inside the original mask so rim seating stays solid.
 */
function flavourFromPhotoSwirl(srcRgba, width, height, swirl, job, albedoY) {
  const out = Buffer.alloc(width * height * 4);
  const squat = Math.min(1, job.squat == null ? 1 : job.squat);
  const pinch = Math.min(1, job.pinch == null ? 1 : job.pinch);
  const fold = job.fold || 0;
  const flipX = !!job.flipX;
  const cx = swirl.cx;
  const rimY = swirl.maxY;
  const seed = job.seed || 1;

  const sample = (sx, sy) => {
    if (sx < 1 || sy < 1 || sx >= width - 2 || sy >= height - 2) return null;
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const fx = sx - x0;
    const fy = sy - y0;
    const at = (xx, yy) => {
      const p = (yy * width + xx) * 4;
      return {
        r: srcRgba[p],
        g: srcRgba[p + 1],
        b: srcRgba[p + 2],
        a: srcRgba[p + 3],
      };
    };
    const a00 = at(x0, y0);
    const a10 = at(Math.min(width - 1, x0 + 1), y0);
    const a01 = at(x0, Math.min(height - 1, y0 + 1));
    const a11 = at(Math.min(width - 1, x0 + 1), Math.min(height - 1, y0 + 1));
    const a =
      a00.a * (1 - fx) * (1 - fy) +
      a10.a * fx * (1 - fy) +
      a01.a * (1 - fx) * fy +
      a11.a * fx * fy;
    if (a < 8) return null;
    return {
      r: a00.r * (1 - fx) * (1 - fy) + a10.r * fx * (1 - fy) + a01.r * (1 - fx) * fy + a11.r * fx * fy,
      g: a00.g * (1 - fx) * (1 - fy) + a10.g * fx * (1 - fy) + a01.g * (1 - fx) * fy + a11.g * fx * fy,
      b: a00.b * (1 - fx) * (1 - fy) + a10.b * fx * (1 - fy) + a01.b * (1 - fx) * fy + a11.b * fx * fy,
      a,
    };
  };

  // Dest footprint ≤ mango mask. Squat shortens the mound (never taller).
  const mangoH = Math.max(1, rimY - swirl.minY);
  const topLimit = rimY - mangoH * squat;

  for (let y = Math.max(0, Math.floor(topLimit) - 2); y <= Math.min(height - 1, swirl.maxY + 8); y++) {
    if (y < topLimit - 0.5) continue;
    for (let x = 0; x < width; x++) {
      // Pinch only toward the tip — full width at the rim so no cream gaps
      const dy0 = rimY - y;
      const t0 = Math.max(0, Math.min(1, dy0 / (mangoH * squat)));
      const localPinch = 1 - (1 - pinch) * Math.pow(t0, 1.15);
      const maxDx = Math.max(1, (swirl.maxX - swirl.minX) * 0.5);
      if (Math.abs(x - cx) > maxDx * localPinch + 1.5) continue;

      const maskX = flipX ? Math.round(2 * cx - x) : x;
      if (maskX < 0 || maskX >= width) continue;
      // Map destination height back onto full mango height for sampling
      const dy = rimY - y;
      const srcYUnsquat = rimY - dy / squat;
      const maskY = Math.round(srcYUnsquat);
      if (maskY < 0 || maskY >= height) continue;
      const maskA = srcRgba[(maskY * width + maskX) * 4 + 3];
      if (maskA < 8) continue;

      let srcX;
      let srcY;
      const rimLock = y >= rimY - 14;
      if (rimLock) {
        // Keep photographic rim seat identical to reference — no warp at the opening
        srcX = flipX ? 2 * cx - x : x;
        srcY = y;
      } else {
        let dx = x - cx;
        const srcXBase = cx + dx / localPinch;
        const t = t0;
        const wobbleX = Math.sin(y * 0.035 + seed * 0.17) * fold * t;
        const wobbleY = Math.sin(x * 0.028 + seed * 0.11) * (fold * 0.35) * t;
        srcX = srcXBase - wobbleX;
        srcY = srcYUnsquat - wobbleY;
        if (flipX) srcX = 2 * cx - srcX;
      }

      let s = sample(srcX, srcY);
      if (!s && !rimLock) s = sample(flipX ? 2 * cx - (cx + (x - cx) / localPinch) : cx + (x - cx) / localPinch, srcYUnsquat);
      if (!s) {
        const p = (Math.round(srcY) * width + Math.round(srcX)) * 4;
        if (p >= 0 && p < srcRgba.length - 3) {
          s = { r: srcRgba[p], g: srcRgba[p + 1], b: srcRgba[p + 2], a: srcRgba[p + 3] };
        }
      }
      if (!s || s.a < 8) continue;

      let r = s.r;
      let g = s.g;
      let b = s.b;
      if (!job.keepPhoto) {
        [r, g, b] = recolorPixel(r, g, b, x, y, job, albedoY);
      }
      const i4 = (y * width + x) * 4;
      out[i4] = clamp(r);
      out[i4 + 1] = clamp(g);
      out[i4 + 2] = clamp(b);
      // Hard silhouette — no cream halo from partial alpha at the tip or edges
      out[i4 + 3] = rimLock ? 255 : s.a >= 48 ? 255 : Math.round(s.a);
    }
  }
  return out;
}

/** Replace near-white ridge streaks with neighbouring fold colour (flavoured swirls only). */
function softenRidgeGlints(rgba, width, height) {
  const tmp = Buffer.from(rgba);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const p = y * width + x;
      const i4 = p * 4;
      if (rgba[i4 + 3] < 8) continue;
      const r = rgba[i4];
      const g = rgba[i4 + 1];
      const b = rgba[i4 + 2];
      const ly = luma(r, g, b) / 255;
      const { sat } = satLum(r, g, b);
      const isGlint = ly > 0.84 && sat < 0.3;
      if (!isGlint) continue;

      let sr = 0;
      let sg = 0;
      let sb = 0;
      let n = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (!dx && !dy) continue;
          const q = (y + dy) * width + (x + dx);
          const qi = q * 4;
          if (rgba[qi + 3] < 8) continue;
          const nr = rgba[qi];
          const ng = rgba[qi + 1];
          const nb = rgba[qi + 2];
          const nly = luma(nr, ng, nb) / 255;
          const { sat: nsat } = satLum(nr, ng, nb);
          if (nly > 0.82 && nsat < 0.28) continue;
          sr += nr;
          sg += ng;
          sb += nb;
          n++;
        }
      }
      if (n < 4) continue;
      tmp[i4] = clamp(Math.round(sr / n));
      tmp[i4 + 1] = clamp(Math.round(sg / n));
      tmp[i4 + 2] = clamp(Math.round(sb / n));
    }
  }
  rgba.set(tmp);
}

/** Kill leftover mango yellow at tips after warp/recolor. */
function fixMangoBleed(rgba, width, height, job, albedoY, swirl) {
  const tipCut = swirl.minY + Math.max(10, Math.round((swirl.maxY - swirl.minY) * 0.12));
  for (let y = 0; y <= tipCut; y++) {
    for (let x = swirl.minX; x <= swirl.maxX; x++) {
      const p = y * width + x;
      const i4 = p * 4;
      if (rgba[i4 + 3] < 8) continue;
      const r = rgba[i4];
      const g = rgba[i4 + 1];
      const b = rgba[i4 + 2];
      const [h, s] = rgbToHsl(r, g, b);
      const ly = luma(r, g, b);
      const forceTip = y <= swirl.minY + 6;
      const isMangoBleed =
        forceTip || (h > 18 && h < 62 && s > 0.18 && ly > 130) || (ly > 200 && s < 0.35);
      if (!isMangoBleed) continue;
      const [nr, ng, nb] = recolorPixel(r, g, b, x, y, job, albedoY);
      rgba[i4] = nr;
      rgba[i4 + 1] = ng;
      rgba[i4 + 2] = nb;
    }
  }
}

async function cropRgba(rgba, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] < 8) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX) throw new Error("empty swirl");
  minX = Math.max(0, minX - 2);
  minY = Math.max(0, minY - 2);
  maxX = Math.min(width - 1, maxX + 2);
  maxY = Math.min(height - 1, maxY + 2);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const buf = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: w, height: h })
    .png()
    .toBuffer();
  return { buf, left: minX, top: minY, w, h };
}

function pasteSwirlInPlace(pixels, flavored, weight, width, height, rimY) {
  for (let p = 0; p < width * height; p++) {
    const y = (p / width) | 0;
    if (y > rimY + 8) continue;
    const i4 = p * 4;
    const a = flavored[i4 + 3];
    if (a < 6) continue;
    const i3 = p * 3;
    const br = pixels[i3];
    const bg = pixels[i3 + 1];
    const bb = pixels[i3 + 2];
    const hard = a >= 200 || weight[p] > 0.42 || isNearCream(br, bg, bb);
    if (hard) {
      pixels[i3] = flavored[i4];
      pixels[i3 + 1] = flavored[i4 + 1];
      pixels[i3 + 2] = flavored[i4 + 2];
    } else {
      const af = a / 255;
      pixels[i3] = Math.round(pixels[i3] * (1 - af) + flavored[i4] * af);
      pixels[i3 + 1] = Math.round(pixels[i3 + 1] * (1 - af) + flavored[i4 + 1] * af);
      pixels[i3 + 2] = Math.round(pixels[i3 + 2] * (1 - af) + flavored[i4 + 2] * af);
    }
  }
}

function flavourLabel(job) {
  return [
    job.flipX ? "flip" : null,
    job.squat && job.squat < 1 ? `squat${job.squat}` : null,
    job.pinch && job.pinch < 1 ? `pinch${job.pinch}` : null,
    job.fold ? `fold${job.fold}` : null,
  ]
    .filter(Boolean)
    .join("+");
}

function swirlSizeCheck(rgba, width, height, mangoBox) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] < 8) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return { w, h, ok: w <= mangoBox.w + 1 && h <= mangoBox.h + 1 };
}

/** Find cup base on the composited canvas for a Booster-style ground shadow. */
function findCupFootprint(data, canvasW, left, top, outW, outH) {
  let baseY = top;
  let minX = canvasW;
  let maxX = 0;
  for (let y = top; y < top + outH; y++) {
    for (let x = left; x < left + outW; x++) {
      const i = (y * canvasW + x) * 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isNearCream(r, g, b)) continue;
      if (y >= baseY) baseY = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  if (maxX <= minX) return { cx: left + outW / 2, baseY: top + outH - 8, halfW: outW * 0.22 };
  return { cx: (minX + maxX) / 2, baseY, halfW: (maxX - minX) / 2 };
}

/** Soft elliptical shadow — same for every flavour (catalog realism). */
function paintGroundShadow(data, canvasW, canvasH, foot) {
  const cx = foot.cx;
  const baseY = foot.baseY + Math.round(foot.halfW * 0.06);
  const rx = foot.halfW * 0.92;
  const ry = Math.max(6, foot.halfW * 0.2);

  for (let y = Math.max(0, Math.floor(baseY - ry * 0.35)); y < Math.min(canvasH, Math.ceil(baseY + ry * 1.8)); y++) {
    for (let x = Math.max(0, Math.floor(cx - rx * 1.25)); x < Math.min(canvasW, Math.ceil(cx + rx * 1.25)); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - baseY) / ry;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const falloff = (1 - d) ** 1.6;
      const strength = SHADOW_STRENGTH * falloff;
      const p = (y * canvasW + x) * 3;
      if (!isNearCream(data[p], data[p + 1], data[p + 2])) continue;
      data[p] = clamp(Math.round(data[p] * (1 - strength * 0.55)));
      data[p + 1] = clamp(Math.round(data[p + 1] * (1 - strength * 0.62)));
      data[p + 2] = clamp(Math.round(data[p + 2] * (1 - strength * 0.78)));
    }
  }
}

/** Very subtle studio grade — whole frame, keeps cream clean. */
function catalogGrade(data, len) {
  for (let i = 0; i < len; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isNearCream(r, g, b)) continue;
    data[i] = clamp(Math.round(r * 1.015 + 1));
    data[i + 1] = clamp(Math.round(g * 1.01 + 0.5));
    data[i + 2] = clamp(Math.round(b * 0.985));
  }
}

async function exportProductJpg(pixels, width, height, destPath, left, top, outW, outH) {
  const { data: cup } = await sharp(pixels, { raw: { width, height, channels: 3 } })
    .resize(outW, outH, { kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const canvas = Buffer.alloc(CANVAS_W * CANVAS_H * 3);
  for (let p = 0; p < CANVAS_W * CANVAS_H; p++) {
    const i = p * 3;
    canvas[i] = CREAM.r;
    canvas[i + 1] = CREAM.g;
    canvas[i + 2] = CREAM.b;
  }

  const footSrc = findCupFootprint(cup, outW, 0, 0, outW, outH);
  const foot = {
    cx: left + footSrc.cx,
    baseY: top + footSrc.baseY,
    halfW: footSrc.halfW,
  };
  paintGroundShadow(canvas, CANVAS_W, CANVAS_H, foot);

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const si = (y * outW + x) * 3;
      const dx = left + x;
      const dy = top + y;
      if (dx < 0 || dy < 0 || dx >= CANVAS_W || dy >= CANVAS_H) continue;
      const di = (dy * CANVAS_W + dx) * 3;
      canvas[di] = cup[si];
      canvas[di + 1] = cup[si + 1];
      canvas[di + 2] = cup[si + 2];
    }
  }

  catalogGrade(canvas, canvas.length);
  await sharp(canvas, { raw: { width: CANVAS_W, height: CANVAS_H, channels: 3 } })
    .jpeg({ quality: 97, chromaSubsampling: "4:4:4" })
    .toFile(destPath);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const srcPath = findSrc();
  const raw = await sharp(srcPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = raw.info;
  const data = raw.data;
  const plate = floodPlate(data, width, height);
  const rim = findPurpleRim(data, width, height, plate);
  if (rim.first < 0) throw new Error("Could not find purple rim");

  const base = Buffer.from(data);
  for (let p = 0; p < width * height; p++) {
    if (!plate[p]) continue;
    const i = p * 3;
    base[i] = CREAM.r;
    base[i + 1] = CREAM.g;
    base[i + 2] = CREAM.b;
  }

  const weight = swirlMask(base, width, height, plate, rim.first);
  const photoSwirl = extractPhotoSwirl(base, weight, width, height, rim.first);
  const mangoBox = { w: photoSwirl.w, h: photoSwirl.h };

  let albedoY = 0;
  let albedoN = 0;
  for (let p = 0; p < width * height; p++) {
    if (weight[p] < 0.5) continue;
    const i4 = p * 4;
    albedoY += luma(photoSwirl.rgba[i4], photoSwirl.rgba[i4 + 1], photoSwirl.rgba[i4 + 2]);
    albedoN++;
  }
  albedoY = albedoY / Math.max(1, albedoN) / 255;

  console.log("CATALOG EXPORT — pristine mango, photo swirls, baked ground shadow");
  console.log("src", srcPath);
  console.log("size", width, "x", height, "rim", rim.first, "mango swirl", mangoBox.w, "x", mangoBox.h);

  const scale = Math.min(CANVAS_W / width, (CANVAS_H * FILL) / height);
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);
  const left = Math.round((CANVAS_W - outW) / 2);
  const top = Math.round((CANVAS_H - outH) / 2);

  let sizeFails = 0;

  for (const job of FLAVOURS) {
    const pixels = Buffer.from(base);

    if (!job.keepPhoto) {
      const flavored = flavourFromPhotoSwirl(photoSwirl.rgba, width, height, photoSwirl, job, albedoY);
      softenRidgeGlints(flavored, width, height);
      fixMangoBleed(flavored, width, height, job, albedoY, photoSwirl);
      const box = swirlSizeCheck(flavored, width, height, mangoBox);
      if (!box.ok) {
        sizeFails++;
        console.warn("OVERSIZE", job.dest, box.w, "x", box.h);
      }
      pasteSwirlInPlace(pixels, flavored, weight, width, height, photoSwirl.maxY);
    }

    await exportProductJpg(pixels, width, height, path.join(OUT, job.dest), left, top, outW, outH);

    console.log("wrote", job.dest, job.keepPhoto ? "(clean reference)" : `(${flavourLabel(job) || "recolor"})`);
  }

  if (sizeFails) console.warn("size check:", sizeFails, "oversize");
  else console.log("size check: all swirls ≤ mango footprint OK");

  fs.copyFileSync(path.join(OUT, "mango-hurrican.jpg"), path.join(OUT, "fruit-booster-cup.jpg"));
  console.log("done — cup packaging untouched from reference");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
