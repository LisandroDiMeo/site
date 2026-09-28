# Architecture

## Project Structure

```
src/
├── assets/styles/       # theme-f0.css (design tokens) + main.css (reset/base)
├── components/
│   ├── shell/            # AppShell, AppNav — shared "Command Prompt" window chrome
│   ├── photos/            # PhotoAlbumCard, PhotoTile, PhotoLightbox
│   └── writing/           # WritingArticle — fetches and renders one .md from the NAS
├── composables/          # useJsonLoader, useMarkdownArticle, useWritingManifest
├── config/                # Environment-driven configuration (env.js)
├── data/                  # ImageCacheManager (singleton image cache)
├── router/                # Vue Router (7 routes, lazy-loaded except /)
├── services/              # writing.service (fetches writing-index.json and articles from the NAS)
├── utils/                 # frontMatter, markdownRenderer, writingTree, photoDayGroups, photoAlbumCover
└── views/                 # Page-level components
```

## Routes

| Route | View | Description |
|-------|------|--------------|
| `/` | HomeView | Landing page: version banner, name/tagline, `now`/`writing`/`elsewhere` sections |
| `/writing/:pathMatch(.*)*` | WritingView | Folder browser over `writing-index.json` (NAS); if the path is an article (file name without `.md`) it renders `WritingArticle` |
| `/photos/:pathMatch(.*)*` | PhotosView | Nested photo browser (albums/subfolders + day-grouped photo grids) backed by `photo-index.json` |
| `/projects` | ProjectsView | Dated project list loaded from `/by-me.json` |
| `/hello` | HelloView | Short bio + `elsewhere` links |
| `/:pathMatch(.*)*` | NotFoundView | 404 |

All routes except `/` are lazy-loaded for code splitting. Each route carries `meta.section` so `AppNav` can highlight the active nav item.

## Components

### Shell (`components/shell/`)

- **AppShell.vue** — the "Command Prompt" window: title bar (decorative `_ □ ×` buttons), content area. Every view wraps its content in this; each view supplies its own prompt line (`C:\lisandro> cd ...`) and `<AppNav>` inside the default slot, since the header content differs per page (Home's version banner vs. the standard prompt+nav pattern elsewhere).
- **AppNav.vue** — the one-line nav (`[home] [writing] [projects] [photos] [hello]`), highlights the active section via an `activeSection` prop.

### Photos (`components/photos/`)

- **PhotoAlbumCard.vue** — album/subfolder card: 2×2 cover mosaic (via `collectFirstPhotos`), name, `total_photos`, approximate date. Loads its 4 cover images through `ImageCacheManager`.
- **PhotoTile.vue** — a single square grid tile. Same IntersectionObserver + `ImageCacheManager` lazy-loading pattern as before, just restyled (no label/frame).
- **PhotoLightbox.vue** — full-content overlay over the window (not a centered modal): close/counter/day label, prev/next, keyboard support (`Esc` closes, arrow keys navigate), and a focus trap across its three buttons while open. Loads the full-resolution image through `ImageCacheManager`.

## Services

### Writing service (`services/writing.service.js`)

Fetches `writing-index.json` (memoised for the page lifetime, retried after a failure) and article `.md` files from `config.externalWritingUrl`. Views go through `useWritingManifest()`; tree helpers (path resolution, sorting, routes) live in `utils/writingTree.js`. If `VITE_EXTERNAL_WRITING_URL` is unset, `/writing` shows "Writing isn't available in this deployment."

### Writing content format

Articles are plain `.md` files from the Obsidian vault with an optional front-matter block (`src/utils/frontMatter.js`; `key: value` lines, not YAML), rendered client-side (`src/utils/markdownRenderer.js`, `src/composables/useMarkdownArticle.js`). `sync-writing.py` copies the same keys into the manifest so listings don't need to download each file:

```
---
title: Capítulo 13
category: Lecturas/Mishima
tags: mishima, nieve-de-primavera
modified: 2026-09-20
note: Optional one-line summary.
draft: false
---
Body in markdown...
```

- Without front-matter the title falls back to the file name and the date to the file's mtime (set in the manifest).
- `category` (else the folder name) is the section label in the article path; `tags` are shown as `#tag`s.
- The URL mirrors the vault: `/writing/<folders>/<file name without .md>`.
- Markdown is rendered with `marked` + a custom renderer (`src/utils/markdownRenderer.js`) for three conventions on top of standard markdown:
  - A `*italic paragraph*` immediately following a `> blockquote` is styled as a short annotation (manu.zone-style asterisk comment).
  - Two images back-to-back in the same paragraph (`![a](x) ![b](y)`) render as a side-by-side figure pair with captions.
  - A paragraph containing only a bare link renders as a "reference card" (label + title + domain).
  - Relative image `src`s are resolved through `config.getPhotoUrl()`; absolute URLs are used as-is.
- Output HTML is sanitized with `DOMPurify` before being rendered via `v-html`.

See `docs/deployment.md` for the sync script and NAS/CORS requirements.

## Photo browsing (`views/PhotosView.vue`)

Business logic is unchanged from before the redesign: `currentPath`/`getCurrentNode()` walk the same nested `photo-index.json` tree (arbitrary depth, no flattening), and every image still goes through `ImageCacheManager`/`config.getPhotoUrl()`. What changed is presentation:

- Subfolders render as `PhotoAlbumCard`s (mosaic cover, name, count).
- A node's direct photos (`file_details`) are grouped by calendar day (derived from each file's `modified` timestamp, via `src/utils/photoDayGroups.js`) into a 6-column grid (3 on mobile), since `photo-index.json` has no day/place data of its own.
- Album cover thumbnails are the first up-to-4 photos found via a depth-first walk of the subtree (`src/utils/photoAlbumCover.js`, memoized per node).
- Clicking a tile opens `PhotoLightbox` instead of the old centered modal.

## Image Cache Manager (`data/ImageCacheManager.js`)

Singleton for managing photo loading across the app — unchanged:

- **Observer pattern** — components subscribe/unsubscribe to image load events
- **Queue management** — max 3 concurrent downloads
- **Retry logic** — 2 retries with exponential backoff (500ms, 1000ms)
- **Quality reduction** — canvas-based resizing to 60% for thumbnails
- **Blob URL lifecycle** — creates and revokes object URLs to prevent memory leaks
- **Stats** — exposes `getStats()` with totalCached, loading, loaded, errors, queueLength, activeDownloads

Any new photo-related component must keep going through this singleton rather than fetching images directly.

## Configuration (`config/env.js`)

Environment-driven config object (unchanged):

| Key | Default | Description |
|-----|---------|-------------|
| `appTitle` | "Lisandro's Site" | App name |
| `deploymentType` | 'local' | 'local' or 'cloud' |
| `baseUrl` | '/' | Base URL for routing |
| `apiBaseUrl` | 'http://localhost:8090' | Backend API URL |
| `photosMode` | 'filesystem' | 'filesystem' or 'static' |
| `localPhotosPath` | '/assets/photos' | Local photo path |
| `externalPhotosUrl` | — | External NAS photo URL |

Helper methods: `getPhotoUrl(photoPath)`, boolean flags `isLocal`, `isCloud`, `isDev`, `isProd`.
