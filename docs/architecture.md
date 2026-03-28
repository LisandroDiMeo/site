# Architecture

## Project Structure

```
src/
├── assets/styles/       # Design tokens, global CSS, Windows 97 theme
├── components/
│   ├── common/          # WindowFrame, NavigationBar, Button, LoadingSpinner
│   ├── icons/           # IconItem (desktop-style clickable icons)
│   ├── photos/          # PhotoThumbnail, PhotoModal
│   └── posts/           # PostForm, PostItem, PostsList
├── config/              # Environment-driven configuration (env.js)
├── data/                # ImageCacheManager (singleton image cache)
├── router/              # Vue Router (7 routes, lazy-loaded)
├── services/            # Axios instance + posts REST API service
├── stores/              # Pinia store for posts
└── views/               # Page-level components
```

## Routes

| Route | View | Description |
|-------|------|-------------|
| `/` | HomeView | Landing page with 4 desktop icons (posts, photos, wishlist, about) |
| `/about` | AboutView | Bio, profile photo, LinkedIn link |
| `/posts` | PostsView | Navigation hub — "all posts" and "posts by group" |
| `/posts/all` | AllPostsView | Fetches and lists posts from backend with pagination |
| `/posts/groups` | PostsByGroupView | Under construction |
| `/photos` | PhotosView | Photo gallery with virtual scrolling, lazy loading, and image caching |
| `/wishlist` | WishlistView | Gift wishlist loaded from `/wishlist.json` |

All routes except `/` are lazy-loaded for code splitting.

## Components

### Common (`components/common/`)

- **WindowFrame.vue** — Windows 97 window container with title bar, close button, and 3D raised borders. Max-width 800px, centered. Wraps all page content.
- **NavigationBar.vue** — Back link component ("← go back"), emits `back` event.
- **Button.vue** — Windows 97 styled button with 3D border effect that inverts on press. Supports disabled state and focus outline.
- **LoadingSpinner.vue** — Displays `hourglass.gif` with optional message.

### Icons (`components/icons/`)

- **IconItem.vue** — Desktop-style clickable icon with label. Swaps between default and hover icon on mouseover. Pixel-rendered images.

### Photos (`components/photos/`)

- **PhotoThumbnail.vue** — Individual photo with loading/error states. Uses `ImageCacheManager` for caching and Intersection Observer for lazy loading. Quality reduced to 60% for thumbnails.
- **PhotoModal.vue** — Full-screen overlay for viewing photos with prev/next navigation and counter.

### Posts (`components/posts/`)

- **PostForm.vue** — Form with content textarea and comma-separated categories input. Loading state shows hourglass in button.
- **PostItem.vue** — Single post display with post-it icon, content, categories, groups, date, and optional edit/delete buttons.
- **PostsList.vue** — Container rendering multiple `PostItem` components with loading spinner and pagination info.

## State Management

### Posts Store (`stores/posts.js`)

Pinia store managing posts data:

- **State**: `posts[]`, `currentPost`, `loading`, `error`
- **Getters**: `totalPosts()`, `postsByCategory(category)`, `postsByGroup(groupId)`
- **Actions**: `fetchPosts()`, `createPost(postData)`, `deletePost(id)`

All actions call the backend through `postsService` and handle loading/error states.

## Services

### API Client (`services/api.js`)

Axios instance with:
- Base URL from `config.apiBaseUrl`
- 10-second timeout
- Request interceptor: injects Bearer token from localStorage
- Response interceptor: extracts `response.data`, handles 401/404/500

### Posts Service (`services/posts.service.js`)

REST API layer over the Axios client:

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

## Image Cache Manager (`data/ImageCacheManager.js`)

Singleton for managing photo loading across the app:

- **Observer pattern** — components subscribe/unsubscribe to image load events
- **Queue management** — max 3 concurrent downloads
- **Retry logic** — 2 retries with exponential backoff (500ms, 1000ms)
- **Quality reduction** — canvas-based resizing to 60% for thumbnails
- **Blob URL lifecycle** — creates and revokes object URLs to prevent memory leaks
- **Stats** — exposes `getStats()` with totalCached, loading, loaded, errors, queueLength, activeDownloads

## Configuration (`config/env.js`)

Environment-driven config object:

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
