# AGENTS.md — Operational Guidelines for AI Coding Agents

## Core Principles and System Invariants

- PixelMangle is a browser-only application. Image files must remain in browser memory; do not introduce uploads, persistence, telemetry, or server APIs unless explicitly requested.
- The image-processing source of truth is [`src/utils/imageMangler.ts`](./src/utils/imageMangler.ts). Keep transformations deterministic except for the existing noise effect, and preserve the `MangleSettings`, `ManglePreset`, and `mangleImage` contracts.
- Use HTML5 Canvas for pixel manipulation and preserve nearest-neighbor behavior where the feature is intended to produce pixel-art output.
- Keep UI orchestration in [`src/App.tsx`](./src/App.tsx) and feature-specific rendering in `src/components/`. Do not move processing logic into presentational components.
- Do not expose secrets in client code. The current app has no environment-variable contract; treat any new public configuration as intentionally client-visible.
- Preserve accessibility basics already present in the UI: semantic buttons, labels, `aria-label` attributes, keyboard-operable controls, and meaningful image `alt` text.

## Tech Stack and Tooling

- Runtime: Node.js `^20.19.0` or `>=22.12.0`.
- Framework: React `19.2.x` with TypeScript `~6.0.x`.
- Build/dev server: Vite `8.3.x`.
- Styling: Tailwind CSS `4.3.x` through `@tailwindcss/vite`, plus global CSS in `src/index.css`.
- Package manager: npm, using the committed `package-lock.json`. Use `npm ci` for clean dependency installation; do not switch package managers or edit the lockfile manually.
- Browser APIs: HTML5 Canvas, `FileReader`, object/image loading, `canvas.toDataURL`, `canvas.toBlob`, and `ClipboardItem`.
- Observability: `@vercel/speed-insights` is mounted in `src/main.tsx`; `index.html` also loads the existing Google AdSense script. Do not remove or duplicate these integrations without an explicit product decision.

## Common Workflows and Command Execution

### 1. Install and Run

From the repository root:

```bash
npm ci
npm run dev
```

Use the Vite URL for manual browser verification. Changes involving canvas, file handling, downloads, or clipboard behavior require browser testing, not just a TypeScript check.

### 2. Verify a Change

Run the narrowest available checks first, then the complete project checks:

```bash
npm run lint
npm run build
```

There is currently no configured unit, integration, or end-to-end test runner. Do not claim test coverage that does not exist. For UI changes, manually verify the affected path with a local Vite server.

### 3. Add or Modify an Effect

1. Extend `MangleSettings` and `DEFAULT_SETTINGS` in `src/utils/imageMangler.ts`.
2. Add the transformation in `mangleImage` at the appropriate stage of the existing pipeline.
3. Add the corresponding control in `src/components/ControlPanel.tsx`.
4. Update relevant presets only when the effect belongs to their intended visual style.
5. Confirm reset, preset application, real-time processing, preview rendering, and all export formats still work.
6. Run `npm run lint` and `npm run build`.

Avoid putting effect calculations directly in React render functions. Keep expensive pixel loops inside the Canvas utility.

### 4. Modify Upload or Export Behavior

Preserve the local-only data flow:

- `UploadZone` reads accepted image files with `FileReader` and passes an `HTMLImageElement` upward.
- `App` owns the active image, dimensions, source size, settings, processing status, and output statistics.
- `BottomBar` owns export-format selection and delegates actual download/clipboard operations to `App`.

When changing file or clipboard handling, retain explicit user feedback for unsupported formats, failed reads, failed canvas conversion, and unavailable clipboard APIs. Do not silently report success.

## Code Conventions and Style

- Use TypeScript types and interfaces rather than untyped objects or broad casts. Keep `noUnusedLocals` and `noUnusedParameters` passing.
- Use functional React components and hooks. Follow the existing state ownership and callback flow instead of introducing a new state library.
- Use `PascalCase` for React components/types, `camelCase` for functions and variables, and descriptive kebab-case IDs for presets.
- Keep imports explicit and preserve `import type` usage where appropriate.
- Match the existing formatting style: single quotes in TypeScript, semicolons, and Tailwind utility classes for component styling.
- Keep comments sparse and limited to non-obvious Canvas or browser behavior.
- Handle errors explicitly. Log unexpected processing or clipboard failures consistently with existing `console.error` calls and show a user-facing toast where the user action can fail.
- Avoid broad catches, silent fallbacks, `any`, and `as unknown as` casts. A fallback is acceptable only when it is already part of the image-size estimation behavior.

## File Map and Boundaries

| Directory / Module | Responsibility | Modifiability Rules |
| --- | --- | --- |
| `src/utils/imageMangler.ts` | Typed settings, presets, Bayer matrix, Game Boy palette, and Canvas degradation pipeline | High caution: preserve public types and processing order; add effects here rather than duplicating pixel logic. |
| `src/App.tsx` | Application state, debounced processing, reset, download, clipboard, and toast orchestration | Keep as the single owner of cross-component state and side effects. |
| `src/components/UploadZone.tsx` | File picker, drag/drop, sample images, and source metadata | Keep accepted image handling local and validate MIME types before reading. |
| `src/components/ControlPanel.tsx` | Presets and controls for `MangleSettings` | Controls must update typed settings and preserve preset selection semantics. |
| `src/components/ViewportCompare.tsx` | Original/output canvases, comparison modes, zoom, and processing overlay | Preserve pointer interaction and canvas refs when changing preview behavior. |
| `src/components/BottomBar.tsx` | Output format, filename generation, copy/reset/download actions | Preserve supported MIME formats and disabled state while processing. |
| `src/index.css` and Tailwind classes | Global styling and layout utilities | Prefer existing Tailwind conventions; avoid reintroducing template styles into new UI. |
| `public/` and `src/assets/images/` | Static favicon, icons, and bundled samples | Keep binary assets appropriately sized and update imports when renaming files. |
| `dist/` | Generated Vite output | Never edit or commit generated output; it is ignored by Git. |

## Pre-Commit Checklist

1. Confirm only intended source and documentation files changed.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Manually verify the affected browser flow, especially Canvas rendering and local file handling.
5. Check that no `.env`, credential, generated `dist/`, or `node_modules/` files were added.
6. If settings or presets changed, test reset, preset selection, slider updates, preview modes, download, and clipboard copy.
