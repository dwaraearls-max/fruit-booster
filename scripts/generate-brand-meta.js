/**
 * Generate favicon sizes + Open Graph share image from brand assets.
 */
const path = require("path");
const sharp = require("sharp");

const root = process.cwd();
const faviconSrc = path.join(root, "public/brand/favicon.png");
const logoSrc = path.join(root, "public/brand/logo.png");

async function writeIcon(size, dest) {
  await sharp(faviconSrc)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(path.join(root, dest));
  console.log(`Wrote ${dest} (${size}x${size})`);
}

async function writeOg() {
  const W = 1200;
  const H = 630;
  const purple = { r: 106, g: 27, b: 154 }; // #6A1B9A
  const yellow = { r: 251, g: 227, b: 81 }; // #FBE351

  const bg = await sharp({
    create: { width: W, height: H, channels: 3, background: purple },
  })
    .png()
    .toBuffer();

  const accent = await sharp({
    create: { width: W, height: 18, channels: 3, background: yellow },
  })
    .png()
    .toBuffer();

  const logo = await sharp(logoSrc)
    .resize({ width: 920, height: 240, fit: "inside" })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoLeft = Math.round((W - (logoMeta.width || 0)) / 2);
  const logoTop = Math.round((H - (logoMeta.height || 0)) / 2) - 36;

  const tagline = Buffer.from(`
    <svg width="${W}" height="80" xmlns="http://www.w3.org/2000/svg">
      <text
        x="50%"
        y="36"
        text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="28"
        font-weight="700"
        fill="#FBE351"
      >Where Tropical Fruits Meet Exotic.</text>
      <text
        x="50%"
        y="68"
        text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="20"
        font-weight="600"
        fill="#FFFFFF"
        fill-opacity="0.85"
      >Premium smoothies · Accra, Ghana</text>
    </svg>
  `);

  await sharp(bg)
    .composite([
      { input: accent, top: 0, left: 0 },
      { input: accent, top: H - 18, left: 0 },
      { input: logo, top: logoTop, left: logoLeft },
      {
        input: tagline,
        top: Math.min(H - 110, logoTop + (logoMeta.height || 0) + 28),
        left: 0,
      },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(root, "public/brand/og.jpg"));

  console.log("Wrote public/brand/og.jpg (1200x630)");
}

async function main() {
  await writeIcon(32, "public/icon.png");
  await writeIcon(32, "src/app/icon.png");
  await writeIcon(180, "src/app/apple-icon.png");
  await writeIcon(180, "public/apple-icon.png");
  await writeIcon(48, "public/favicon.png");
  await writeIcon(192, "public/icon-192.png");
  await writeOg();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
