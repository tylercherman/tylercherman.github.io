/**
 * Generate the social share card (public/og-default.jpg).
 *
 *   node scripts/make-og-card.mjs
 *
 * This is the image that appears when the site's link is pasted into iMessage, Slack,
 * WhatsApp, LinkedIn and so on. It is NOT taken from the page — it's a dedicated file,
 * which is why it kept showing an old work still long after the site had changed.
 *
 * The card is composed rather than cropped. A share card wants 1200x630 (1.91:1), and
 * every photo of Tyler is portrait — cropping one that hard puts an unflattering band
 * across the face. Composing keeps the portrait at its natural shape and uses the
 * remaining space for his name.
 *
 * Re-run this after changing the headshot.
 */
import sharp from 'sharp';

const W = 1200, H = 630, PHOTO_W = 430, BG = '#0a0a0b';
const SOURCE = 'src/assets/tyler-cherman-headshot.jpg';
const OUT = 'public/og-default.jpg';

const photo = await sharp(SOURCE)
  .resize(PHOTO_W, H, { fit: 'cover', position: 'top' })
  .toBuffer();

// Softens the vertical edge where the photo meets the background.
const fade = Buffer.from(`<svg width="220" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" x2="1">
    <stop offset="0" stop-color="${BG}" stop-opacity="1"/>
    <stop offset="1" stop-color="${BG}" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="220" height="${H}" fill="url(#g)"/>
</svg>`);

const text = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800;
            font-size: 86px; letter-spacing: -2px; fill: #f2f2f0; }
    .role { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 500;
            font-size: 25px; letter-spacing: 7px; fill: #b9b9be; }
    .url  { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 500;
            font-size: 21px; letter-spacing: 3px; fill: #6f6f77; }
  </style>
  <text x="80" y="285" class="name">TYLER</text>
  <text x="80" y="375" class="name">CHERMAN</text>
  <text x="84" y="432" class="role">EDITOR  |  CREATIVE</text>
  <text x="84" y="548" class="url">TYLERCHERMAN.COM</text>
</svg>`);

await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
  .composite([
    { input: photo, left: W - PHOTO_W, top: 0 },
    { input: fade,  left: W - PHOTO_W, top: 0 },
    { input: text,  left: 0, top: 0 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(OUT);

const { width, height, size } = await sharp(OUT).metadata();
console.log(`  wrote ${OUT} — ${width}x${height}, ${(size/1024).toFixed(0)}KB`);
