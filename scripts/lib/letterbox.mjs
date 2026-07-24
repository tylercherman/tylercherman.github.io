/**
 * Detect and remove letterbox bars from a poster frame.
 *
 * Vimeo thumbnails are generated at the video's container ratio, so a 2.39:1 film
 * delivered in a 16:9 container arrives with black bars baked into the JPEG. Four
 * of Tyler's seventeen posters are like this — up to 33% of the image is bar.
 *
 * That was invisible while tiles matched each video's own ratio, but the grid now
 * crops everything to a uniform 16:9, so a letterboxed source renders as visible
 * black bands. Cropping the bars off means `object-fit: cover` has real image to
 * work with and trims the sides instead.
 */

import sharp from 'sharp';

/**
 * Find bar thickness at top and bottom.
 * Works on the greyscale raw buffer, sampling every 8th pixel across each row.
 */
export async function detectBars(path, { threshold = 10 } = {}) {
  const img = sharp(path);
  const { width, height } = await img.metadata();
  const { data } = await img.greyscale().raw().toBuffer({ resolveWithObject: true });

  const rowMean = (y) => {
    let sum = 0;
    let n = 0;
    for (let x = 0; x < width; x += 8) {
      sum += data[y * width + x];
      n++;
    }
    return sum / n;
  };

  let top = 0;
  let bottom = 0;
  while (top < height / 2 && rowMean(top) < threshold) top++;
  while (bottom < height / 2 && rowMean(height - 1 - bottom) < threshold) bottom++;

  const contentHeight = height - top - bottom;
  return {
    width,
    height,
    top,
    bottom,
    contentHeight,
    contentRatio: width / contentHeight,
    wastedPercent: ((top + bottom) / height) * 100,
    letterboxed: top + bottom > height * 0.03,
  };
}

/**
 * Crop bars off in place, if any are found.
 * Returns the detection result with `cropped: true|false`.
 */
export async function stripLetterbox(path, { threshold = 10, minWaste = 3 } = {}) {
  const info = await detectBars(path, { threshold });

  if (info.wastedPercent < minWaste) return { ...info, cropped: false };

  // sharp can't write to the file it's reading — buffer first.
  const buf = await sharp(path)
    .extract({ left: 0, top: info.top, width: info.width, height: info.contentHeight })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  const { writeFile } = await import('node:fs/promises');
  await writeFile(path, buf);

  return { ...info, cropped: true };
}
