# Architecture

## Project Structure

```
src/
├── assets/styles/       # theme-f0.css (design tokens) + main.css (reset/base)
├── components/
│   ├── shell/            # AppShell, AppNav — shared "Command Prompt" window chrome
│   └── photos/            # PhotoAlbumCard, PhotoTile, PhotoLightbox
├── composables/          # useJsonLoader, useMarkdownArticle
├── config/                # Environment-driven configuration (env.js)
├── data/                  # ImageCacheManager (singleton image cache)
├── router/                # Vue Router (7 routes, lazy-loaded except /)
├── services/              # Axios instance + posts REST API service
├── stores/                # Pinia store for posts
├── utils/                 # frontMatter, markdownRenderer, writingSlug, photoDayGroups, photoAlbumCover
└── views/                 # Page-level components
```

## Routes

| Route | View | Description |
|-------|------|--------------|
| `/` | HomeView | Landing page: version banner, name/tagline, `now`/`writing`/`elsewhere` sections |
| `/writing` | WritingView | Posts grouped by category (from `categories[0]`), with jump-to anchors |
| `/writing/:id` | ArticleView | Renders a post's markdown content, keyed by post `id`/`_id` |
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

## State Management

### Posts Store (`stores/posts.js`)

Pinia store managing posts data — unchanged from before:

- **State**: `posts[]`, `currentPost`, `loading`, `error`
- **Getters**: `totalPosts()`, `postsByCategory(category)`, `postsByGroup(groupId)`
- **Actions**: `fetchPosts()`, `createPost(postData)`, `deletePost(id)`

All actions call the backend through `postsService` and handle loading/error states. `WritingView`/`ArticleView`/`HomeView` all read from this store and degrade to an empty/hidden state when `config.posts.enabled` is `false` (cloud deployments).

## Services

### API Client (`services/api.js`)

Axios instance with:
- Base URL from `config.apiBaseUrl`
- 10-second timeout
- Request interceptor: injects Bearer token from localStorage
- Response interceptor: extracts `response.data`, handles 401/404/500

### Posts Service (`services/posts.service.js`)

REST API layer over the Axios client (unchanged contract):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `getAllPosts(params)` | GET /posts | Fetch posts (limit, skip, sort_by, ascending) |
| `getPostById(id)` | GET /posts/{id} | Fetch single post |
| `createPost(data)` | POST /posts | Create post |
| `updatePost(id, data)` | PUT /posts/{id} | Update post |
| `deletePost(id)` | DELETE /posts/{id} | Delete post |
| `searchPosts(query, limit)` | GET /posts/search | Full-text search |
| `getPostsByCategory(category)` | GET /posts/category/{cat} | Filter by category |
| `addGroupsToPost(id, groupIds)` | POST /posts/{id}/groups | Associate groups |
| `removeGroupsFromPost(id, groupIds)` | DELETE /posts/{id}/groups | Remove groups |

All methods are feature-gated by `config.posts.enabled` (requires `VITE_API_BASE_URL` to be set).

### Post content format (Writing/Article)

The backend post model is still just `{ id/_id, content, categories, groups, createdAt }` — there's no `title`, no separate tags, no modified date, no rich body. Instead, `content` is treated as a **markdown document with an optional front-matter block**, parsed and rendered entirely client-side (`src/utils/frontMatter.js`, `src/utils/markdownRenderer.js`, `src/composables/useMarkdownArticle.js`):

```
---
title: Play Billing upgrades without tears
modified: 2026-08-20
note: Updated after shipping the second round of plan changes.
---
Body in markdown...
```

- If `content` doesn't start with `---`, there's no front-matter and the whole string is the body (old posts still render, just without a real title/note).
- `categories[0]` groups the post into a section on `/writing` (the "jump to" anchors); `categories.slice(1)` are shown as `#tag`s on the article page.
- Publish date is `createdAt`; modified date comes from `meta.modified` and is omitted if absent — nothing is invented.
- Markdown is rendered with `marked` + a custom renderer (`src/utils/markdownRenderer.js`) for three conventions on top of standard markdown:
  - A `*italic paragraph*` immediately following a `> blockquote` is styled as a short annotation (manu.zone-style asterisk comment).
  - Two images back-to-back in the same paragraph (`![a](x) ![b](y)`) render as a side-by-side figure pair with captions.
  - A paragraph containing only a bare link renders as a "reference card" (label + title + domain).
  - Relative image `src`s are resolved through `config.getPhotoUrl()`; absolute URLs are used as-is. These body images are **not** part of `photo-index.json`/`ImageCacheManager` — they're author-supplied URLs.
- Output HTML is sanitized with `DOMPurify` before being rendered via `v-html`.
- The article route uses the post's real `id`/`_id` as the URL param (`/writing/:id`), not a generated slug.

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
