import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceUrl =
  "https://static.wixstatic.com/media/2ccee0_563c7748c4254f8988b144d56353f3ad~mv2.png/v1/fill/w_1400,h_1500,al_c,q_90,usm_0.66_1.00_0.01/2ccee0_563c7748c4254f8988b144d56353f3ad~mv2.png";
const outputJpeg = path.resolve(__dirname, "../app/assets/dr-ernest-ofori-sarpong.jpg");
const publicJpeg = path.resolve(__dirname, "../public/images/dr-ernest-ofori-sarpong.jpg");

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Failed to download founder portrait (${response.status})`);
}

const input = Buffer.from(await response.arrayBuffer());
const image = sharp(input).rotate();

await fs.mkdir(path.dirname(outputJpeg), { recursive: true });
await fs.mkdir(path.dirname(publicJpeg), { recursive: true });

await image.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(outputJpeg);
await fs.copyFile(outputJpeg, publicJpeg);

const meta = await sharp(outputJpeg).metadata();
console.log(`Saved ${outputJpeg} (${meta.width}x${meta.height})`);
console.log(`Copied to ${publicJpeg}`);
