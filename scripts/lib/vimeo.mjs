/**
 * Shared Vimeo helpers.
 *
 * Used by both scripts/migrate.mjs (one-time Squarespace migration) and
 * scripts/add-work.mjs (the ongoing "paste a Vimeo link" workflow).
 *
 * Key detail: unlisted videos need their privacy hash in the oEmbed request or
 * Vimeo returns an error rather than metadata. Bare-ID requests silently fail
 * for exactly the four unlisted pieces in Tyler's portfolio.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Parse any Vimeo URL form into { id, hash }.
 * Handles:
 *   https://vimeo.com/905002018
 *   https://vimeo.com/1024552311/75a27e6025      (unlisted, path form)
 *   https://vimeo.com/1024552311?h=75a27e6025    (unlisted, query form)
 *   https://player.vimeo.com/video/905002018
 *   905002018                                     (bare id)
 */
export function parseVimeoUrl(input) {
  const raw = String(input).trim();

  if (/^\d+$/.test(raw)) return { id: raw, hash: null };

  let url;
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    throw new Error(`Not a URL or Vimeo id: ${raw}`);
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const idIndex = segments.findIndex((s) => /^\d+$/.test(s));
  if (idIndex === -1) throw new Error(`No Vimeo video id found in: ${raw}`);

  const id = segments[idIndex];
  // Hash may be the next path segment, or the ?h= query param.
  const pathHash = segments[idIndex + 1];
  const hash =
    url.searchParams.get('h') ||
    (pathHash && /^[a-z0-9]+$/i.test(pathHash) ? pathHash : null);

  return { id, hash };
}

/** Build the canonical vimeo.com URL, including hash for unlisted videos. */
export function vimeoCanonicalUrl(id, hash) {
  return hash ? `https://vimeo.com/${id}/${hash}` : `https://vimeo.com/${id}`;
}

/**
 * Fetch oEmbed metadata. `width` asks Vimeo for a larger thumbnail —
 * the default is a useless 200x150.
 */
export async function fetchVimeoMeta(id, hash, { width = 1920 } = {}) {
  const target = vimeoCanonicalUrl(id, hash);
  const endpoint =
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(target)}&width=${width}`;

  const res = await fetch(endpoint, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(
      `Vimeo oEmbed failed for ${id} (${res.status}). ` +
        (hash ? 'Check the privacy hash.' : 'If this video is unlisted, include its hash.')
    );
  }

  const d = await res.json();
  return {
    id,
    hash,
    vimeoTitle: d.title ?? null,
    width: d.width ?? null,
    height: d.height ?? null,
    duration: d.duration ?? null,
    thumbnail: d.thumbnail_url ?? null,
    thumbnailWidth: d.thumbnail_width ?? null,
    thumbnailHeight: d.thumbnail_height ?? null,
  };
}

/**
 * Vimeo encodes thumbnail dimensions in the filename as `-d_WIDTHxHEIGHT`.
 * Rewriting it is the only reliable way to get a full-size poster — the oEmbed
 * `width` param caps out well below source resolution.
 */
export function upgradeThumbnailUrl(url, targetWidth = 1920) {
  if (!url) return null;
  return url.replace(/-d_\d+x\d+/, `-d_${targetWidth}`);
}

/** Download a URL to disk, creating parent directories as needed. */
export async function download(url, destPath) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  await mkdir(dirname(destPath), { recursive: true });
  await writeFile(destPath, Buffer.from(await res.arrayBuffer()));
  return destPath;
}

/** Turn a title into a filesystem- and URL-safe slug. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/['"“”‘’]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Classify aspect ratio into a named bucket for layout decisions. */
export function orientationOf(width, height) {
  if (!width || !height) return 'landscape';
  const r = width / height;
  if (r < 0.9) return 'vertical';
  if (r < 1.1) return 'square';
  if (r > 2.2) return 'scope';
  return 'landscape';
}
