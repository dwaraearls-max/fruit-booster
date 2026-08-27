const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const assets = String.raw`C:\Users\USER\.cursor\projects\c-Users-USER-Desktop-websites-FRUIT-FUSION\assets`;
const dest = path.join(__dirname, "..", "public", "products");

const map = {
  "cup-strawberry-fusionx.png": "strawberry-fusion.jpg",
  "cup-mango-passion-fusionx.png": "mango-passion.jpg",
  "cup-pineapple-ginger-fusionx.png": "pineapple-ginger.jpg",
  "cup-watermelon-mint-fusionx.png": "watermelon-mint.jpg",
  "cup-mixed-berry-fusionx.png": "mixed-berry.jpg",
  "cup-tropical-glow-fusionx.png": "tropical-glow.jpg",
  "cup-citrus-burst-fusionx.png": "citrus-burst.jpg",
  "cup-green-vitality-fusionx.png": "green-vitality.jpg",
};

(async () => {
  for (const [srcName, outName] of Object.entries(map)) {
    const src = path.join(assets, srcName);
    const out = path.join(dest, outName);
    if (!fs.existsSync(src)) throw new Error("missing " + src);
    await sharp(src).jpeg({ quality: 90 }).toFile(out);
    console.log("wrote", outName);
  }
  const straw = path.join(assets, "cup-strawberry-fusionx.png");
  await sharp(straw).jpeg({ quality: 90 }).toFile(path.join(dest, "fruit-fusion-cup.jpg"));
  await sharp(straw).png().toFile(path.join(dest, "fruit-fusion-cup.png"));
  await sharp(straw).jpeg({ quality: 90 }).toFile(path.join(dest, "cup-base.jpg"));
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
