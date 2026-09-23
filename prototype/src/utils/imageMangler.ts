/**
 * Pure client-side HTML5 Canvas image degradation and artifact pipeline.
 * High-performance, zero external dependencies.
 */

export interface MangleSettings {
  pixelDensity: number; // 1 to 100%
  jpegQuality: number; // 1 to 100%
  jpegPasses: number; // 1 to 5
  bitDepth: 'full' | '8bit' | '4bit' | '2bit' | 'gameboy';
  dither: boolean;
  noise: number; // 0 to 100%
  noiseType: 'color' | 'mono';
  colorBleed: number; // 0 to 100% (chromatic aberration)
  crtEffect: boolean;
  crtIntensity: number; // 0 to 100%
  contrast: number; // -50 to 100
  brightness: number; // -50 to 50
  saturation: number; // -100 to 100
  monochrome: boolean;
  sharpness: number; // 0 to 100
  exportUpscaled: boolean; // true = keep original display resolution with crisp nearest-neighbor; false = actual low-res dimensions
}

export const DEFAULT_SETTINGS: MangleSettings = {
  pixelDensity: 100,
  jpegQuality: 100,
  jpegPasses: 1,
  bitDepth: 'full',
  dither: false,
  noise: 0,
  noiseType: 'mono',
  colorBleed: 0,
  crtEffect: false,
  crtIntensity: 40,
  contrast: 0,
  brightness: 0,
  saturation: 0,
  monochrome: false,
  sharpness: 0,
  exportUpscaled: true,
};

export interface ManglePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  settings: Partial<MangleSettings>;
}

export const PRESETS: ManglePreset[] = [
  {
    id: 'deep-fried',
    name: 'Deep Fried Meme',
    emoji: '🍟',
    description: 'Crushed JPEG, high contrast, oversaturated grain',
    settings: {
      pixelDensity: 60,
      jpegQuality: 6,
      jpegPasses: 3,
      bitDepth: 'full',
      dither: false,
      noise: 45,
      noiseType: 'color',
      colorBleed: 40,
      crtEffect: false,
      contrast: 85,
      brightness: 10,
      saturation: 90,
      monochrome: false,
      sharpness: 60,
    },
  },
  {
    id: 'game-boy',
    name: 'Game Boy 8-Bit',
    emoji: '🎮',
    description: '160x144 pixel matrix with classic 4-shade green palette',
    settings: {
      pixelDensity: 14,
      jpegQuality: 100,
      jpegPasses: 1,
      bitDepth: 'gameboy',
      dither: true,
      noise: 0,
      noiseType: 'mono',
      colorBleed: 0,
      crtEffect: true,
      crtIntensity: 35,
      contrast: 25,
      brightness: 5,
      saturation: 0,
      monochrome: false,
      sharpness: 0,
    },
  },
  {
    id: 'web-2000s',
    name: '2000s Web JPEG',
    emoji: '🌐',
    description: 'Dial-up crunch with visible 8x8 DCT ringing blocks',
    settings: {
      pixelDensity: 45,
      jpegQuality: 5,
      jpegPasses: 4,
      bitDepth: 'full',
      dither: false,
      noise: 15,
      noiseType: 'color',
      colorBleed: 20,
      crtEffect: false,
      contrast: 15,
      brightness: 0,
      saturation: 10,
      monochrome: false,
      sharpness: 30,
    },
  },
  {
    id: 'surveillance',
    name: 'Surveillance Cam',
    emoji: '📹',
    description: 'Grainy low-bit monochrome with CRT scanlines',
    settings: {
      pixelDensity: 30,
      jpegQuality: 25,
      jpegPasses: 2,
      bitDepth: '4bit',
      dither: true,
      noise: 55,
      noiseType: 'mono',
      colorBleed: 10,
      crtEffect: true,
      crtIntensity: 70,
      contrast: 40,
      brightness: -5,
      saturation: 0,
      monochrome: true,
      sharpness: 20,
    },
  },
  {
    id: 'arcade-crt',
    name: 'Arcade CRT Monitor',
    emoji: '📺',
    description: 'Heavy scanlines, color separation, 8-bit arcade palette',
    settings: {
      pixelDensity: 35,
      jpegQuality: 100,
      jpegPasses: 1,
      bitDepth: '8bit',
      dither: false,
      noise: 10,
      noiseType: 'mono',
      colorBleed: 60,
      crtEffect: true,
      crtIntensity: 65,
      contrast: 20,
      brightness: 5,
      saturation: 30,
      monochrome: false,
      sharpness: 20,
    },
  },
];

// Game Boy 4 shades of olive green
const GAME_BOY_PALETTE = [
  [15, 56, 15],     // Darkest green (#0f380f)
  [48, 98, 48],     // Dark green    (#306230)
  [139, 172, 15],   // Light green   (#8bac0f)
  [155, 188, 15],   // Lightest      (#9bbc0f)
];

// Bayer 4x4 matrix for ordered dithering
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

/**
 * Main function to mangle an image using HTML5 Canvas
 */
export async function mangleImage(
  sourceImage: HTMLImageElement,
  settings: MangleSettings,
  targetCanvas: HTMLCanvasElement
): Promise<{ width: number; height: number; estimatedSizeKb: number }> {
  const origW = sourceImage.naturalWidth || sourceImage.width;
  const origH = sourceImage.naturalHeight || sourceImage.height;

  if (origW === 0 || origH === 0) {
    return { width: 0, height: 0, estimatedSizeKb: 0 };
  }

  // 1. Calculate downscaled dimensions based on pixel density
  const density = Math.max(1, Math.min(100, settings.pixelDensity));
  const scaledW = Math.max(8, Math.round(origW * (density / 100)));
  const scaledH = Math.max(8, Math.round(origH * (density / 100)));

  // Setup offscreen canvas for downscaling and pixel processing
  const offCanvas = document.createElement('canvas');
  offCanvas.width = scaledW;
  offCanvas.height = scaledH;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  if (!offCtx) throw new Error('Could not create offscreen canvas context');

  // Draw source image downscaled
  offCtx.drawImage(sourceImage, 0, 0, scaledW, scaledH);

  // 2. Extract ImageData for low-level pixel manipulation
  const imgData = offCtx.getImageData(0, 0, scaledW, scaledH);
  const data = imgData.data;

  // Pre-calculate adjustment factors
  const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
  const brightnessOffset = settings.brightness * 2.55;
  const saturationFactor = (settings.saturation + 100) / 100;
  const noiseAmt = settings.noise;
  const isMonoNoise = settings.noiseType === 'mono';
  const isMono = settings.monochrome;
  const bitDepth = settings.bitDepth;
  const useDither = settings.dither;

  // Determine levels for bit-depth posterization
  let posterizeLevels = 256;
  if (bitDepth === '8bit') posterizeLevels = 8;     // 8 levels per RGB channel
  else if (bitDepth === '4bit') posterizeLevels = 4; // 4 levels per RGB channel
  else if (bitDepth === '2bit') posterizeLevels = 2; // 2 levels (black/white or 8 colors)

  for (let y = 0; y < scaledH; y++) {
    for (let x = 0; x < scaledW; x++) {
      const idx = (y * scaledW + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // Monochrome conversion if requested
      if (isMono) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      }

      // Brightness & Contrast
      if (settings.brightness !== 0) {
        r += brightnessOffset;
        g += brightnessOffset;
        b += brightnessOffset;
      }

      if (settings.contrast !== 0) {
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }

      // Saturation
      if (settings.saturation !== 0 && !isMono) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;
      }

      // Noise & Grain
      if (noiseAmt > 0) {
        const noiseIntensity = (noiseAmt / 100) * 110;
        if (isMonoNoise) {
          const n = (Math.random() - 0.5) * noiseIntensity * 2;
          r += n;
          g += n;
          b += n;
        } else {
          r += (Math.random() - 0.5) * noiseIntensity * 2;
          g += (Math.random() - 0.5) * noiseIntensity * 2;
          b += (Math.random() - 0.5) * noiseIntensity * 2;
        }
      }

      // Dithering threshold adjustment
      let ditherThreshold = 0;
      if (useDither) {
        const bayerVal = BAYER_4X4[y % 4][x % 4];
        ditherThreshold = (bayerVal / 16 - 0.5) * 48;
      }

      // Color Bit-Depth / Quantization
      if (bitDepth === 'gameboy') {
        const luminance = Math.max(0, Math.min(255, 0.299 * r + 0.587 * g + 0.114 * b + ditherThreshold));
        let shadeIdx = 0;
        if (luminance < 64) shadeIdx = 0;
        else if (luminance < 128) shadeIdx = 1;
        else if (luminance < 192) shadeIdx = 2;
        else shadeIdx = 3;

        const [gr, gg, gb] = GAME_BOY_PALETTE[shadeIdx];
        r = gr;
        g = gg;
        b = gb;
      } else if (posterizeLevels < 256) {
        const step = 255 / (posterizeLevels - 1);
        r = Math.round(Math.max(0, Math.min(255, r + ditherThreshold)) / step) * step;
        g = Math.round(Math.max(0, Math.min(255, g + ditherThreshold)) / step) * step;
        b = Math.round(Math.max(0, Math.min(255, b + ditherThreshold)) / step) * step;
      }

      // Clamp values
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
    }
  }

  // 3. Chromatic Aberration / Color Bleed
  if (settings.colorBleed > 0) {
    const bleedShift = Math.max(1, Math.round((settings.colorBleed / 100) * (scaledW * 0.05)));
    const copy = new Uint8ClampedArray(data);

    for (let y = 0; y < scaledH; y++) {
      for (let x = 0; x < scaledW; x++) {
        const currentIdx = (y * scaledW + x) * 4;

        // Shift Red channel to the right
        const rx = Math.min(scaledW - 1, x + bleedShift);
        const rIdx = (y * scaledW + rx) * 4;
        data[currentIdx] = copy[rIdx]; // Takes Red from shifted source

        // Shift Blue channel to the left
        const bx = Math.max(0, x - bleedShift);
        const bIdx = (y * scaledW + bx) * 4;
        data[currentIdx + 2] = copy[bIdx + 2]; // Takes Blue from shifted source
      }
    }
  }

  // 4. CRT Scanlines
  if (settings.crtEffect) {
    const scanlineDarkening = (settings.crtIntensity / 100) * 0.7;
    const factor = 1 - scanlineDarkening;
    for (let y = 0; y < scaledH; y += 2) {
      for (let x = 0; x < scaledW; x++) {
        const idx = (y * scaledW + x) * 4;
        data[idx] = Math.round(data[idx] * factor);
        data[idx + 1] = Math.round(data[idx + 1] * factor);
        data[idx + 2] = Math.round(data[idx + 2] * factor);
      }
    }
  }

  // Write modified pixels back to offscreen canvas
  offCtx.putImageData(imgData, 0, 0);

  // 5. Sharpening filter if enabled
  if (settings.sharpness > 0) {
    applySharpen(offCtx, scaledW, scaledH, settings.sharpness / 100);
  }

  // 6. Lossy JPEG compression artifacts (with optional multi-pass crunch)
  const quality = Math.max(0.01, Math.min(1.0, settings.jpegQuality / 100));
  let compressedCanvas = offCanvas;

  if (quality < 0.99) {
    const passes = Math.max(1, Math.min(5, settings.jpegPasses));
    let currentDataUrl = offCanvas.toDataURL('image/jpeg', quality);

    for (let p = 1; p < passes; p++) {
      await new Promise<void>((resolve) => {
        const tempImg = new Image();
        tempImg.onload = () => {
          offCtx.drawImage(tempImg, 0, 0, scaledW, scaledH);
          currentDataUrl = offCanvas.toDataURL('image/jpeg', quality);
          resolve();
        };
        tempImg.src = currentDataUrl;
      });
    }

    // Final read into an image element for drawing onto destination
    await new Promise<void>((resolve) => {
      const finalImg = new Image();
      finalImg.onload = () => {
        offCtx.drawImage(finalImg, 0, 0, scaledW, scaledH);
        resolve();
      };
      finalImg.src = currentDataUrl;
    });
  }

  // 7. Output to target Canvas
  const outW = settings.exportUpscaled ? origW : scaledW;
  const outH = settings.exportUpscaled ? origH : scaledH;

  targetCanvas.width = outW;
  targetCanvas.height = outH;

  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) throw new Error('Target canvas context unavailable');

  // Disable smoothing for razor-sharp pixelated retro look
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(offCanvas, 0, 0, scaledW, scaledH, 0, 0, outW, outH);

  // Estimate output file size in KB
  let estimatedSizeKb = 0;
  try {
    const sampleData = targetCanvas.toDataURL('image/jpeg', quality);
    estimatedSizeKb = Math.round((sampleData.length * 3) / 4 / 1024);
  } catch {
    estimatedSizeKb = Math.round((outW * outH * 3) / 1024);
  }

  return { width: outW, height: outH, estimatedSizeKb };
}

/**
 * 3x3 Convolution Sharpen kernel
 */
function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  // Simple 3x3 sharpen kernel:
  //  0  -s   0
  // -s 1+4s -s
  //  0  -s   0
  const s = strength * 0.8;
  const center = 1 + 4 * s;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const top = ((y - 1) * w + x) * 4;
      const bottom = ((y + 1) * w + x) * 4;
      const left = (y * w + (x - 1)) * 4;
      const right = (y * w + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          center * src[idx + c] -
          s * (src[top + c] + src[bottom + c] + src[left + c] + src[right + c]);
        dst[idx + c] = Math.max(0, Math.min(255, val));
      }
      dst[idx + 3] = src[idx + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}
