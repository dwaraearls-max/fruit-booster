const sharp = require("sharp");
const path = require("path");

const logoPath = path.join(__dirname, "..", "public", "brand", "logo.png");
const brandDir = path.join(__dirname, "..", "public", "brand");
const appDir = path.join(__dirname, "..", "src", "app");
const publicDir = path.join(__dirname, "..", "public");

(async () => {
  const meta = await sharp(logoPath).metadata();
  const w = meta.width;
  const h = meta.height;
  // Cup sits roughly in horizontal center — crop a square around it
  const side = Math.min(h, Math.floor(w * 0.28));
  const left = Math.floor((w - side) / 2);
  const top = Math.max(0, Math.floor((h - side) / 2));

  const cup = await sharp(logoPath)
    .extract({ left, top, width: side, height: Math.min(side, h - top) })
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(cup).png().toFile(path.join(brandDir, "favicon.png"));
  await sharp(cup).resize(32, 32).png().toFile(path.join(appDir, "icon.png"));
  await sharp(cup).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
  await sharp(cup).resize(48, 48).png().toFile(path.join(publicDir, "favicon.png"));
  console.log("cup favicon ok", side, "from", w, "x", h);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
