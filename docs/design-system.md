# Design System

The application implements a minimal "Command Prompt" aesthetic (Windows 2000 style), theme **F0 ("paper")** only, driven by CSS custom properties. Source spec: `lisandrodimeo-redesign/HANDOFF.md` and its mockups (design references, not shipped code).

## Style Files

- **`theme-f0.css`** — all CSS custom properties defining the visual language (colors, font variable, type scale, shell padding)
- **`main.css`** — global reset, base styles, link/focus styles, the shared `blink` keyframe used by Home's cursor

## Color Tokens (theme F0)

| Token | Value | Usage |
|-------|-------|-------|
| `--f0-page` | `#dcd8d0` | Background around the window |
| `--f0-window` | `#fbfaf6` | Window/console background |
| `--f0-text` | `#2a2a2a` | Body text |
| `--f0-muted` | `#86827a` | Dates, prompts, meta lines |
| `--f0-strong` | `#111111` | Headings, strong link text |
| `--f0-accent` | `#0a246a` | Section labels (`> now`), active nav, tags |
| `--f0-rule` | `#b8b4ac` | Dotted link underlines, dashed dividers |
| `--f0-title-a` / `--f0-title-b` | `#0a246a` / `#a6caf0` | Title bar gradient |
| `--f0-code-bg` / `--f0-code-border` | `#f1eee7` / `#d6d2c9` | Code blocks |

## Typography

- **Font**: `--font-body`, defaults to `'Ubuntu Mono', monospace` (Google Fonts, weights 400/700 + italic 400, loaded via `<link>` in `index.html`). Swap the variable to `'Ubuntu', sans-serif` to try the sans alternative explored in the handoff — it's the only thing that needs to change.
- **Sizes** (all as CSS vars): body 17px (`--fs-body`), article body 18px (`--fs-article-body`), meta 15px (`--fs-meta`), home name 64px (`--fs-home-name`), page H1 44px (`--fs-h1`), article H1 48px (`--fs-article-h1`). Line-height 1.65 body / 1.7 article.
- Responsive: under 768px, `theme-f0.css` shrinks the home-name/H1 sizes and the shell padding variables (see below); two-column grids collapse to one column via view-level media queries.

## The window shell

Shared by every page via `AppShell.vue`:

- Outer page padding: `--shell-page-padding-y`/`-x` (56px/120px desktop, 16px/16px mobile).
- Window: `2px solid #c0c0c0` border + `1px solid #404040` outline + soft drop shadow, background `--f0-window`.
- 30px title bar: gradient background (`--f0-title-a` → `--f0-title-b`), white bold text, decorative `_ □ ×` buttons (non-functional, `aria-hidden`).
- Content padding: `--shell-content-padding-y`/`-x` (36px/48px desktop, 20px/20px mobile).
- Links: no underline, 1px dotted bottom border in `--f0-rule`, solid on hover (see `main.css`).
- Each page supplies its own muted prompt line (`C:\lisandro> cd ...`) and `<AppNav>` above its content — `AppShell` only owns the window chrome, not the header layout, since Home's header (version banner + big name) differs structurally from every other page's prompt+nav pattern.

## Assets

Only `public/assets/smiley.png` remains, used as the favicon (`index.html`). The Windows 97-era pixel-art icons (folder icons, hourglass, post-it, tree, etc.) were removed along with the desktop/explorer metaphor they supported — there are no per-file icons or folder icons in the new design.
