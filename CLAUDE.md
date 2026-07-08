# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal site ("retro-site") built with Vue 3 (Composition API), styled as a Windows 97 desktop. Combines a professional/social presentation card with a photo gallery, a posts/blog feature backed by a separate API, and a wishlist.

## Commands

```bash
npm run dev              # Dev server on port 3000
npm run dev:local        # Dev server with .env (local mode: posts API + filesystem/NAS photos)
npm run build:local      # Production build using local env
npm run build:production # Production build for Cloudflare Pages (.env.production)
npm run preview          # Preview a production build
npm run lint             # ESLint (--fix) over .vue,.js,.jsx,.cjs,.mjs
```

There is no test suite configured in this repo.

Photo index regeneration (requires SSH/SFTP access to the NAS):

```bash
python generate-photo-directory.py --user <ssh_user> --password <ssh_password> --host <nas_ip> --remote-path <photo_directory>
```

This writes `public/photo-index.json`, which the photo gallery depends on, respecting exclusions in `public/dont-show.json`.

## Architecture

Full details live in `docs/architecture.md`, `docs/deployment.md`, and `docs/design-system.md` — read them for anything beyond this summary.

### Deployment modes (local vs. cloud)

The app behaves differently depending on `VITE_DEPLOYMENT_TYPE`, read via `src/config/env.js`:

- **local** (`.env`): posts API enabled against `http://localhost:8090`, photos served from filesystem or NAS.
- **cloud** (`.env.production`, Cloudflare Pages): posts API disabled entirely (no `VITE_API_BASE_URL`), photos served only from the external NAS URL (`VITE_EXTERNAL_PHOTOS_URL`).

Any feature touching posts must be feature-gated on `config.posts.enabled`, since it's unavailable in cloud deployments. Check `src/config/env.js` for the full config shape and helper flags (`isLocal`, `isCloud`, `isDev`, `isProd`, `getPhotoUrl()`).

### Data flow for posts

`views` → `stores/posts.js` (Pinia) → `services/posts.service.js` → `services/api.js` (Axios instance with auth interceptor, 10s timeout, response unwrapping). Keep this layering when adding endpoints — views should not call the service or Axios instance directly.

### Photo gallery

`ImageCacheManager` (`src/data/ImageCacheManager.js`) is a singleton that all photo components share for loading/caching. It implements a bounded concurrent-download queue (max 3), retry with backoff, and canvas-based quality reduction for thumbnails, releasing blob URLs when done. `PhotoThumbnail.vue` and `PhotoModal.vue` both go through it — do not bypass it with direct `<img src>` fetches for gallery photos, or caching/concurrency guarantees break.

### Routing

Vue Router routes are lazy-loaded (code-split) except `/`. See `docs/architecture.md` for the full route table before adding new views.

### Styling

Windows 97 aesthetic is driven entirely by CSS custom properties in `src/assets/styles/design-tokens.css`, plus `main.css` (resets/utilities) and `windows97.css` (scrollbar/button/input chrome). New components should consume existing tokens (colors, spacing scale, border styles) rather than hardcoding values — see `docs/design-system.md` for the token reference, especially the raised/inset 3D border convention (raised: white top/left + black bottom/right; inset: reversed; inverts on press).

### Path alias

`@` resolves to `src/` (configured in `vite.config.js`).
