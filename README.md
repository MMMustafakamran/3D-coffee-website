# EMBER Coffee Scroll Site testing

An Apple-style scroll film built from the supplied coffee video. The opening film is scrubbed from 192 WebP frames at 24 fps, followed by a complete brand homepage with story, craft, blend details, gallery, CTA, navigation, and footer.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000/>.

### Run the demo API

In a second terminal:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The API runs at <http://localhost:4000>. During local development the client
automatically uses that API; in the Docker demo it uses the same-origin `/api`
proxy. You can override the API host with
`NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api` if needed.

The demo staff queue is available at <http://localhost:3000/staff/orders>.
The default demo key is `ember-demo-staff`. Reset demo orders with:

```bash
cd backend
npm run db:reset
```

## Build

```bash
npm run build
```

Produces a static export in `out/`, deployable to Vercel or any static host.

### Run the combined demo

```bash
npm run demo:up
```

Then open <http://localhost:8080/>. Docker Compose runs the static frontend,
API, and persistent SQLite demo database together. Node 22+ is used by the API
for its built-in SQLite driver.

## Asset pipeline

- Source video: `assets/source-video.mp4` (ignored from git)
- Scroll frames: `public/frames24/frame_0001.webp` through `public/frames24/frame_0192.webp`
- Manifest: `public/frames/frames.json`
- Supporting crops: `public/images/`
- Scroll engine: `public/main.js`

The source film is 8 seconds at 1920×1080 / 24 FPS. Frames are exported at the source rate (24 fps) and 1400px width for smoother scroll scrubbing.

## Content note

EMBER is a provisional concept brand. Replace the brand name, claims, CTA destination, and blend specifications before publishing as a real product site.
