# Hero video

Drop the montage here as `hero.mp4`, then set `hero.video` in `src/data/site.json`
to `/video/hero.mp4`. Until then the hero shows `src/assets/hero-placeholder.jpg`.

## Export specs

- **1920x1080**, H.264 MP4, yuv420p
- **No audio track at all** — not silent audio, no track. Browsers block autoplay
  on anything with audio, and the track is dead weight.
- 20-30 seconds, seamless loop
- Target **under 8 MB**. GitHub Pages allows 100 MB per file, but every visitor
  downloads this, so smaller is better.
- Also export a **poster frame** as `src/assets/hero-poster.jpg` — shown on
  mobile, on slow connections, and when the OS requests reduced motion.

Suggested ffmpeg pass (strips audio with `-an`):

    ffmpeg -i input.mov -c:v libx264 -crf 23 -preset slow \
      -vf scale=1920:-2 -pix_fmt yuv420p -movflags +faststart -an hero.mp4
