const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const src = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-USER-Desktop-websites-FRUIT-FUSION/assets",
  "c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_6cccd47fff09b7409c6ddd0ceefd674d_images_image-b964ae64-ce59-4752-acf0-97eec92e76c6.jpg",
);

const brandDir = path.join(__dirname, "..", "public", "brand");
const appDir = path.join(__dirname, "..", "src", "app");
const publicDir = path.join(__dirname, "..", "public");

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

(async () => {
  if (!fs.existsSync(src)) throw new Error("Source missing: " + src);

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const idx = (x, y) => (y * width + x) * channels;
  const bg = [data[0], data[1], data[2]];
  console.log("bg sample", bg, "size", width, height);

  const isBg = (r, g, b) => {
    if (colorDist(r, g, b, bg[0], bg[1], bg[2]) < 48) return true;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // solid field purple: low green, purple-ish, not letter highlights
    return r > 35 && r < 140 && g < 60 && b > 70 && b < 190 && r < b + 10 && g < r && lum < 85;
  };

  const visited = new Uint8Array(width * height);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = idx(x, y);
    if (!isBg(data[i], data[i + 1], data[i + 2])) return;
    visited[p] = 1;
    queue.push(x, y);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const y = queue.pop();
    const x = queue.pop();
    data[idx(x, y) + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let i = 0; i < data.length; i += channels) {
    if (data[i + 3] === 0) continue;
    if (colorDist(data[i], data[i + 1], data[i + 2], bg[0], bg[1], bg[2]) < 30) {
      data[i + 3] = 0;
    }
  }

  const transparentPng = await sharp(data, { raw: { width, height, channels } }).png().toBuffer();

  const logoBuf = await sharp(transparentPng).trim({ threshold: 8 }).png().toBuffer();
  await fs.promises.writeFile(path.join(brandDir, "logo.png"), logoBuf);
  const logoMeta = await sharp(logoBuf).metadata();
  console.log("logo saved", logoMeta.width, "x", logoMeta.height);

  // Square favicon: pad logo into square transparent canvas, then resize
  const side = Math.max(logoMeta.width, logoMeta.height);
  const favBase = await sharp({
    create: {
      width: side,
      height: side,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logoBuf, gravity: "centre" }])
    .png()
    .toBuffer();

  await sharp(favBase).resize(512, 512).png().toFile(path.join(brandDir, "favicon.png"));
  await sharp(favBase).resize(32, 32).png().toFile(path.join(appDir, "icon.png"));
  await sharp(favBase).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
  await sharp(favBase).resize(48, 48).png().toFile(path.join(publicDir, "favicon.png"));

  // ICO-compatible multi-size PNG named favicon.ico is imperfect; use PNG route via app/icon.png.
  // Still drop a 32px png copy at /favicon.ico path won't work as ico — skip fake ico.

  console.log("favicon + app icons saved");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
