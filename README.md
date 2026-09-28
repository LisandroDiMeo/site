# My Site

This is the repository to maintain my own site. It's styled as a minimal "Command Prompt" terminal window (Windows 2000-era, theme F0) — a deliberately text-first, low-chrome look.

The main goal to have this page is to have a digital presentation card not only for professional inquiries, but also for social ones :)
Here you will find more about me, my writing, and one of my recent favorite hobbies: photography.

## Tech Stack

- Vue 3 (Composition API) + Vue Router + Pinia
- Vite
- Axios
- `marked` + `DOMPurify` (markdown rendering for Writing articles)
- Python / Paramiko (photo indexing)

## Installation

Copy `.env.example` to `.env` (and fill in the values for your setup, see [Deployment](docs/deployment.md)), then:

```bash
npm install
npm run dev:local   # local mode: filesystem/NAS photos
```

Other useful scripts:

```bash
npm run dev              # dev server without local env
npm run build:local       # production build using local env
npm run build:production  # production build for Cloudflare Pages
npm run preview           # preview a production build
npm run lint              # ESLint over .vue,.js,.jsx,.cjs,.mjs
```

## Documentation

Docs were generated mainly to assist AI models for updates, feature development, and maintenance.

- [Architecture](docs/architecture.md) — project structure, components, routes, services, stores, markdown post format, and configuration
- [Deployment](docs/deployment.md) — environment setup, build scripts, Cloudflare Pages config, and photo index generation
- [Design System](docs/design-system.md) — theme F0 design tokens, typography, window shell, and assets
