# Vue.js Windows 97 Themed Notes Application

A retro-styled notes application built with Vue.js 3, inspired by Windows 97 design patterns.

## 🏗️ Architecture Overview

This application follows the Vue 3 Composition API pattern with Pinia for state management and a clean separation of concerns:

```
src/
├── assets/          # Static assets and styles
├── components/      # Reusable Vue components
├── router/          # Vue Router configuration
├── services/        # API and business logic services
├── stores/          # Pinia state management
└── views/           # Page-level components
```

## 📱 Views (Pages)

Views represent the main pages/routes of the application:

### HomeView.vue
- **Purpose**: Main landing page displaying navigation icons
- **Features**: Windows 97 styled icon grid with hover effects
- **Navigation**: Routes to notes, photos, and about sections

### NotesView.vue & AllNotesView.vue
- **Purpose**: Display and manage notes collection
- **Features**: List all notes with Windows 97 window styling
- **State**: Connected to `useNotesStore` for data management

### WriteNoteView.vue
- **Purpose**: Create new notes with form validation
- **Features**: Text area input, loading states, success feedback
- **UX**: Retro-styled form with Windows 97 button and input styling

### AboutView.vue & PhotosView.vue
- **Purpose**: Static content pages
- **Design**: Consistent Windows 97 theme with window frames

## 🏪 Stores (State Management)

Using Pinia for reactive state management:

### notes.js
- **State**: `notes[]`, `currentNote`, `loading`, `error`
- **Getters**: `totalNotes()`, `notesByCategory()`, `notesByGroup()`
- **Actions**: `fetchNotes()`, `createNote()`, `deleteNote()`
- **Purpose**: Centralized notes data management with API integration

## 🔧 Services (API Layer)

Clean separation between UI and data layer:

### api.js
- **Purpose**: Axios configuration with interceptors
- **Features**: Request/response interceptors, error handling, auth token management
- **Configuration**: Base URL, timeout, content-type headers

### notes.service.js
- **Purpose**: Notes-specific API operations
- **Methods**: CRUD operations, search, category filtering, group management
- **Pattern**: Service layer abstraction over raw API calls

## 🎨 Design System

The application uses a comprehensive design token system (`design-tokens.css`) implementing Windows 97 aesthetics:

- **Typography**: Courier and Arial fonts, pixel-perfect sizing
- **Colors**: Classic Windows 97 palette (grays, blues, whites)
- **Components**: Buttons, inputs, windows with authentic 3D borders
- **Icons**: Pixelated retro icons with hover states

## 🧩 Key Components

### WindowFrame.vue
- **Purpose**: Authentic Windows 97 window container
- **Features**: Title bar, close button, 3D borders
- **Usage**: Wraps all page content for consistent theming

### Button.vue
- **Purpose**: Windows 97 styled interactive buttons
- **Features**: 3D border effects, active/focus states, icon support
- **Accessibility**: Proper focus indicators and disabled states

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 📁 File Organization

- `components/common/` - Reusable UI components
- `components/icons/` - Icon-specific components
- `components/notes/` - Notes-related components
- `assets/styles/` - CSS files and design tokens
- `public/assets/` - Static images and icons 