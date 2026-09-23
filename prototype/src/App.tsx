import { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UploadZone, SAMPLE_IMAGES } from './components/UploadZone';
import { ControlPanel } from './components/ControlPanel';
import { ViewportCompare } from './components/ViewportCompare';
import { BottomBar, ExportFormat } from './components/BottomBar';
import {
  MangleSettings,
  DEFAULT_SETTINGS,
  PRESETS,
  mangleImage,
} from './utils/imageMangler';

export default function App() {
  const [settings, setSettings] = useState<MangleSettings>(DEFAULT_SETTINGS);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [activeImageName, setActiveImageName] = useState<string>('pet_photo.jpg');
  const [originalSizeBytes, setOriginalSizeBytes] = useState<number | null>(480 * 1024);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [outputStats, setOutputStats] = useState<{
    width: number;
    height: number;
    estimatedSizeKb: number;
    processingTimeMs: number;
  } | null>(null);

  const mangledCanvasRef = useRef<HTMLCanvasElement>(null);
  const processingTimeoutRef = useRef<number | null>(null);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Process image with current settings
  const triggerProcessing = useCallback(
    async (img: HTMLImageElement, currentSettings: MangleSettings) => {
      if (!mangledCanvasRef.current) return;
      setIsProcessing(true);
      const startTime = performance.now();

      try {
        const stats = await mangleImage(img, currentSettings, mangledCanvasRef.current);
        const duration = Math.round(performance.now() - startTime);

        setOutputStats({
          width: stats.width,
          height: stats.height,
          estimatedSizeKb: stats.estimatedSizeKb,
          processingTimeMs: duration,
        });
      } catch (err) {
        console.error('Error mangling image:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Debounced processor for smooth slider dragging
  useEffect(() => {
    if (!activeImage) return;

    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = window.setTimeout(() => {
      triggerProcessing(activeImage, settings);
    }, 35); // 35ms debounce allows silky 30-60fps slider updates

    return () => {
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [settings, activeImage, triggerProcessing]);

  // Load initial sample image on mount
  useEffect(() => {
    const initialSample = SAMPLE_IMAGES[0];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setActiveImage(img);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      // Apply Deep Fried preset initially for instant fun retro demo!
      const initialPreset = PRESETS[0];
      setActivePresetId(initialPreset.id);
      setSettings((prev) => ({
        ...prev,
        ...initialPreset.settings,
      }));
    };
    img.src = initialSample.src;
  }, []);

  // Handle image selected via upload or sample click
  const handleImageSelected = (
    img: HTMLImageElement,
    name: string,
    bytes?: number
  ) => {
    setActiveImage(img);
    setActiveImageName(name);
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    if (bytes) {
      setOriginalSizeBytes(bytes);
    } else {
      setOriginalSizeBytes(img.naturalWidth * img.naturalHeight * 0.4);
    }
    showToast(`Loaded ${name}`);
  };

  // Apply a preset
  const handleApplyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(preset.id);
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    showToast(`Applied preset: ${preset.name}`);
  };

  // Change settings from control sliders
  const handleSettingsChange = (newSettings: MangleSettings) => {
    setActivePresetId(null); // Custom settings now active
    setSettings(newSettings);
  };

  // Reset to original pristine settings
  const handleReset = () => {
    setActivePresetId(null);
    setSettings(DEFAULT_SETTINGS);
    showToast('Reset all effects to pristine original');
  };

  // Download mangled image
  const handleDownload = (format: ExportFormat, filename: string) => {
    const canvas = mangledCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = filename;

    // Use quality setting if exporting as JPEG
    const quality = format === 'image/jpeg' ? Math.max(0.01, settings.jpegQuality / 100) : 0.95;
    link.href = canvas.toDataURL(format, quality);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloaded ${filename}!`);
  };

  // Copy mangled canvas to clipboard
  const handleCopyToClipboard = async (): Promise<boolean> => {
    const canvas = mangledCanvasRef.current;
    if (!canvas || !navigator.clipboard || !window.ClipboardItem) {
      showToast('Clipboard copy not supported in this browser');
      return false;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (!blob) throw new Error('Failed to create blob');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      showToast('Copied mangled image to clipboard!');
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Could not copy to clipboard');
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Bar Header */}
      <Navbar onReset={handleReset} isProcessing={isProcessing} />

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Left Panel: Upload Zone & Control Sliders */}
        <aside aria-label="Controls Panel" className="w-full lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col gap-4">
          <UploadZone
            onImageSelected={handleImageSelected}
            activeImageName={activeImageName}
            imageDimensions={imageDimensions}
            originalSizeBytes={originalSizeBytes}
          />

          <ControlPanel
            settings={settings}
            onChange={handleSettingsChange}
            onApplyPreset={handleApplyPreset}
            activePresetId={activePresetId}
          />
        </aside>

        {/* Right Panel: Interactive Dual Viewport Stage */}
        <section aria-label="Preview Viewport" className="flex-1 min-w-0 flex flex-col min-h-[500px]">
          <ViewportCompare
            originalImage={activeImage}
            mangledCanvasRef={mangledCanvasRef}
            isProcessing={isProcessing}
            outputStats={outputStats}
          />
        </section>
      </main>

      {/* Floating Sticky Bottom Bar */}
      <BottomBar
        onDownload={handleDownload}
        onReset={handleReset}
        onCopyToClipboard={handleCopyToClipboard}
        activePresetId={activePresetId}
        activeImageName={activeImageName}
        originalSizeBytes={originalSizeBytes}
        estimatedSizeKb={outputStats?.estimatedSizeKb || null}
        isProcessing={isProcessing}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-5 z-50 px-4 py-2 bg-neutral-900 border border-amber-400 text-amber-200 text-xs font-mono rounded shadow-2xl flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
