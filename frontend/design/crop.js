#!/usr/bin/env node
/**
 * Crop a band out of a PNG so tall screenshots stay readable.
 * Usage: node design/crop.js <src.png> <y> <height> [out.png] [scaleWidth]
 */
const sharp = require("sharp");

const [src, y, h, out, scaleWidth] = process.argv.slice(2);
const dest =
  out ||
  `/private/tmp/claude-502/-Users-khtnax-Documents-lumina/9845c70f-27c3-401d-9be3-aed82cdbaec1/scratchpad/crop.png`;

(async () => {
  const meta = await sharp(src).metadata();
  const top = Math.max(0, Math.min(Number(y), meta.height - 1));
  const height = Math.min(Number(h), meta.height - top);
  let pipe = sharp(src).extract({ left: 0, top, width: meta.width, height });
  if (scaleWidth) pipe = pipe.resize({ width: Number(scaleWidth) });
  await pipe.toFile(dest);
  console.log(dest, `${meta.width}x${height} @${top}`);
})();
