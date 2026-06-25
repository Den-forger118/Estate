import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(
  __dirname,
  "../.cursor-user-assets/ernest-ofori-sarpong-source.png",
);
const outputWebp = path.resolve(__dirname, "../public/images/ernest-ofori-sarpong.webp");
const outputJpeg = path.resolve(__dirname, "../public/images/ernest-ofori-sarpong.jpg");

async function progressiveResize(buffer, targetWidth) {
  const meta = await sharp(buffer).metadata();
  let width = meta.width ?? 237;
  let current = buffer;

  const milestones = [];
  while (width < targetWidth) {
    width = Math.min(Math.round(width * 1.75), targetWidth);
    milestones.push(width);
  }

  for (const w of milestones) {
    current = await sharp(current)
      .resize(w, null, { kernel: sharp.kernel.lanczos3, fastShrinkOnLoad: false })
      .toBuffer();
  }

  return current;
}

const source = await sharp(input).rotate().toBuffer();
const upscaled = await progressiveResize(source, 1400);

const enhanced = await sharp(upscaled)
  .median(3)
  .blur(0.35)
  .sharpen({ sigma: 1.65, m1: 1.4, m2: 3.2, x1: 2.5, y2: 14 })
  .normalize()
  .linear(1.06, -(128 * 0.06))
  .modulate({ brightness: 1.02, saturation: 1.05 })
  .toBuffer();

await sharp(enhanced)
  .jpeg({ quality: 94, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(outputJpeg);

await sharp(enhanced)
  .webp({ quality: 96, effort: 6, smartSubsample: true, nearLossless: true })
  .toFile(outputWebp);

const finalMeta = await sharp(enhanced).metadata();
console.log(`Enhanced founder portrait: ${finalMeta.width}x${finalMeta.height}`);
console.log(`JPEG: ${outputJpeg}`);
console.log(`WebP: ${outputWebp}`);
