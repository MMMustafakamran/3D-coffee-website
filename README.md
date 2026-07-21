# EMBER Coffee Scroll Site

An Apple-style scroll film built from the supplied coffee video. The opening film is scrubbed from 144 WebP frames, followed by a complete brand homepage with story, craft, blend details, gallery, CTA, navigation, and footer.

## Run locally

From this folder, start a static server:

```powershell
python -m http.server 4189
```

Then open <http://localhost:4189/>. The site must be served over HTTP; opening `index.html` directly prevents the frame manifest from loading in some browsers.

## Asset pipeline

- Source video: `assets/source-video.mp4` (ignored from git)
- Scroll frames: `frames/frame_0001.webp` through `frames/frame_0144.webp`
- Manifest: `frames/frames.json`
- Supporting crops: `images/`
- Scroll engine: `main.js`

The source film is 8 seconds at 1920×1080 / 24 FPS. Frames were exported at 18 FPS and 1400px width for a balance between smooth scrubbing and page weight.

## Content note

EMBER is a provisional concept brand. Replace the brand name, claims, CTA destination, and blend specifications before publishing as a real product site.
