# My Site

This is the repository to maintain my own site. It's styled as a minimal "Command Prompt" terminal window (Windows 2000-era, theme F0) — a deliberately text-first, low-chrome look.

The main goal to have this page is to have a digital presentation card not only for professional inquiries, but also for social ones :)
Here you will find more about me, my writing, and one of my recent favorite hobbies: photography.

## Tech Stack

- Vue 3 (Composition API) + Vue Router + Pinia
- Vite
- Axios
- `marked` + `DOMPurify` (markdown rendering for Writing/Article posts)
- Python / Paramiko (photo indexing)

## Installation

If you like to replicate a site like this one, you will find it's very simple to follow. With the following npm commands you should be able to run it

```bash
npm install
npm run dev
```

## Documentation

Docs were generated mainly to assist AI models for updates, feature development, and maintenance.

- [Architecture](architecture.md) — project structure, components, routes, services, stores, markdown post format, and configuration
- [Deployment](deployment.md) — environment setup, build scripts, Cloudflare Pages config, and photo index generation
- [Design System](design-system.md) — theme F0 design tokens, typography, window shell, and assets
