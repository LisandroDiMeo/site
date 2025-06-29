# Windows 97 Design System

This design system provides consistent styling for the Vue.js application with authentic Windows 97 aesthetics.

## 🎨 Design Tokens

All design tokens are defined in `src/assets/styles/design-tokens.css`. Use these tokens instead of hardcoded values to ensure consistency.

### Colors

```css
/* Primary Colors */
var(--color-primary)           /* #000080 - Windows blue */
var(--color-primary-light)     /* #1084d0 - Gradient blue */

/* Background Colors */
var(--color-bg-primary)        /* #c0c0c0 - Main gray */
var(--color-bg-secondary)      /* #ffffff - White */

/* Text Colors */
var(--color-text-primary)      /* #000000 - Black text */
var(--color-text-disabled)     /* #808080 - Disabled text */
```

### Typography

```css
/* Font Families */
var(--font-family-primary)     /* MS Sans Serif, Courier, Arial */
var(--font-family-mono)        /* Courier New, monospace */

/* Font Sizes */
var(--font-size-xs)           /* 8px */
var(--font-size-sm)           /* 11px - Standard Windows 97 */
var(--font-size-base)         /* 12px */
var(--font-size-lg)           /* 16px */
```

### Spacing

```css
var(--space-1)                /* 2px - Micro spacing */
var(--space-2)                /* 4px - Small spacing */
var(--space-3)                /* 8px - Base spacing */
var(--space-4)                /* 12px - Medium spacing */
var(--space-5)                /* 16px - Large spacing */
var(--space-6)                /* 20px - Extra large spacing */
```

### Borders

```css
/* 3D Raised Borders (Buttons, Windows) */
border: var(--border-raised);
border-top-color: var(--border-raised-top);
border-left-color: var(--border-raised-left);
border-right-color: var(--border-raised-right);
border-bottom-color: var(--border-raised-bottom);

/* 3D Inset Borders (Inputs, Text Areas) */
border: var(--border-inset);
border-top-color: var(--border-inset-top);
border-left-color: var(--border-inset-left);
border-right-color: var(--border-inset-right);
border-bottom-color: var(--border-inset-bottom);
```

## 🧩 Component Guidelines

### Buttons

Use the button design tokens for consistent styling:

```css
.btn {
  background-color: var(--btn-bg);
  padding: var(--btn-padding-y) var(--btn-padding-x);
  font-size: var(--btn-font-size);
  font-family: var(--btn-font-family);
  /* Apply raised border pattern */
  border: var(--border-raised);
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
}
```

### Windows

Use window tokens for consistent window styling:

```css
.window {
  background-color: var(--window-bg);
  box-shadow: var(--shadow-small);
  max-width: var(--container-max-width);
}

.window-header {
  background: var(--window-header-bg);
  color: var(--window-header-color);
  padding: var(--window-header-padding);
}
```

### Input Fields

Use input tokens for form elements:

```css
.input-field {
  background-color: var(--input-bg);
  padding: var(--input-padding-y) var(--input-padding-x);
  font-size: var(--input-font-size);
  font-family: var(--input-font-family);
  /* Apply inset border pattern */
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
}
```

## 🎯 Utility Classes

Pre-built utility classes are available for common patterns:

```css
/* Typography */
.text-sm                      /* Small text */
.text-base                    /* Base size text */
.font-primary                 /* Primary font family */
.font-bold                    /* Bold weight */

/* Spacing */
.p-3                          /* Padding: 8px */
.m-4                          /* Margin: 12px */

/* Borders */
.border-raised                /* 3D raised border */
.border-inset                 /* 3D inset border */

/* Colors */
.bg-primary                   /* Primary background */
.text-primary                 /* Primary text color */
```

## 📝 Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Follow the 3D border pattern** for authentic Windows 97 look
3. **Use consistent spacing** from the spacing scale
4. **Apply pixelated rendering** for icons: `image-rendering: pixelated`
5. **Use the primary font** for most text elements
6. **Implement focus states** with dotted outlines for accessibility

## 🔄 Maintenance

When updating styles:
1. Check if a design token exists first
2. If not, consider adding it to `design-tokens.css`
3. Update all components to use the new token
4. Document the change in this file

## 🎨 Color Palette Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Windows Blue | `#000080` | Headers, primary elements |
| Light Blue | `#1084d0` | Gradients, hover states |
| Gray | `#c0c0c0` | Main background, buttons |
| White | `#ffffff` | Input backgrounds, highlights |
| Black | `#000000` | Text, borders |
| Disabled Gray | `#808080` | Disabled text, secondary elements | 