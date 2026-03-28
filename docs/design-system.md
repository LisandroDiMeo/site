# Design System

The application implements a Windows 97 aesthetic through a comprehensive design token system and themed CSS.

## Style Files

- **`design-tokens.css`** — all CSS custom properties defining the visual language
- **`main.css`** — global resets, base styles, utility classes
- **`windows97.css`** — scrollbar styling, button/input effects, font smoothing

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#000080` | Windows blue, links, window headers |
| Background | `#008080` | Teal desktop background |
| Surface | `#c0c0c0` | Window/button backgrounds |
| Grays | `#ffffff` / `#808080` / `#404040` / `#000000` | Borders, text, shadows |
| Success | `#008000` | Confirmation states |
| Warning | `#808000` | Caution states |
| Error | `#800000` | Error states |
| Info | `#000080` | Informational states |

## Typography

- **Fonts**: "MS Sans Serif", Courier, Arial
- **Base size**: 14px (Windows 97 standard)
- **Scale**: 10px (xs) to 31px (2xl)
- Font smoothing disabled for pixel-perfect rendering

## 3D Border System

The signature Windows 97 look comes from asymmetric borders:

- **Raised** (buttons, window frames): white top/left, black bottom/right
- **Inset** (inputs, text areas): black top/left, white bottom/right
- **Active press**: border colors invert
- Border widths: 1-3px

## Spacing

Scale: 0, 2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px

## Component Tokens

| Component | Key Properties |
|-----------|---------------|
| Button | padding 4px 12px, 14px font, gray background, raised borders |
| Input | white background, inset borders, 14px font |
| Window | gray background, blue gradient header, 20px padding |
| Icons | sizes: 21px, 31px, 42px, 62px |

## Assets

Pixel-art icons in `public/assets/`, all rendered with `image-rendering: pixelated`:

- `closedfolder.png` / `openfolder.png` — folder icons with hover swap
- `hourglass.gif` — loading animation
- `postit.png` — post icon
- `tree.png` — wishlist icon
- `person_doc.png` — fallback photo icon
- `smiley.png` — favicon
- `success.png` — checkmark icon
- `me.jpg` — profile photo
