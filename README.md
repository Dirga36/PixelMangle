# PixelMangle

PixelMangle is a client-side image degradation laboratory built with React, TypeScript, Vite, and HTML5 Canvas. Upload an image, apply retro and lossy effects in real time, compare the original with the mangled result, and export the processed image without sending it to a server.

## Overview

PixelMangle runs the complete image workflow in the browser:

- Load a local image by file picker or drag and drop, or choose one of the bundled sample images.
- Apply presets such as Deep Fried Meme, Game Boy, 2000s Web JPEG, Surveillance Cam, and Arcade CRT.
- Tune pixel density, JPEG quality and recompression passes, bit depth, dithering, noise, color bleed, CRT scanlines, contrast, brightness, saturation, monochrome, and sharpening.
- Preview the original and output with a split slider, side-by-side view, or mangled-only view at fit, 200%, or 400% zoom.
- Download JPEG, PNG, or WEBP output, or copy a PNG representation to the system clipboard.

The processing implementation uses offscreen and target `<canvas>` elements. It scales the source, transforms pixel data, optionally performs repeated JPEG compression, and uses nearest-neighbor rendering for crisp pixel-art output. No application API or database is required; image data stays in browser memory. Vercel Speed Insights is mounted from `src/main.tsx`, and the HTML entry point includes the Google AdSense script.

## Quick Start

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (required by the installed Vite version)
- npm
- A modern browser with HTML5 Canvas and Clipboard API support for all features

### Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Dirga36/PixelMangle.git
   cd PixelMangle
   ```

2. Install the locked dependencies:

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open the local URL printed by Vite.

There is no `.env` file required by the current application. Do not add secrets or server credentials to the client bundle.

## Development Commands

| Task | Command | Description |
| --- | --- | --- |
| Development | `npm run dev` | Starts the Vite development server with HMR. |
| Build | `npm run build` | Runs the TypeScript project build, then creates the production bundle in `dist/`. |
| Lint | `npm run lint` | Runs ESLint across the repository. |
| Preview | `npm run preview` | Serves the built `dist/` output locally. |

The project currently has no automated unit, integration, or end-to-end test script. Use the build and lint commands plus manual browser verification for changes.

## Project Structure

```text
.
├── public/
│   ├── favicon.png
│   └── icons.svg
├── src/
│   ├── assets/images/       # Bundled sample images
│   ├── components/
│   │   ├── BottomBar.tsx    # Format selection, copy, reset, and download actions
│   │   ├── ControlPanel.tsx # Preset buttons and effect controls
│   │   ├── Navbar.tsx       # Application header and repository link
│   │   ├── UploadZone.tsx   # Local upload, drag/drop, and sample selection
│   │   └── ViewportCompare.tsx # Canvas comparison modes, zoom, and split slider
│   ├── utils/
│   │   └── imageMangler.ts  # Settings, presets, and Canvas pixel pipeline
│   ├── App.tsx              # Page state and component orchestration
│   ├── App.css              # Legacy/template styles retained by the app
│   ├── index.css            # Tailwind import and global browser styles
│   └── main.tsx             # React entry point and Speed Insights
├── index.html               # Vite entry document and external analytics script
├── vite.config.ts           # React and Tailwind Vite plugins
├── eslint.config.js         # ESLint flat configuration
├── tsconfig*.json           # TypeScript project configuration
└── package.json             # npm scripts and dependencies
```

## Contributing

Keep image processing client-side unless a future change explicitly introduces a server boundary. Preserve the typed `MangleSettings` and preset contracts when adding effects, and keep UI changes aligned with the existing component boundaries. Before opening a pull request, run `npm run lint` and `npm run build`, then manually exercise upload, preset application, comparison modes, export formats, and clipboard behavior in a browser.
